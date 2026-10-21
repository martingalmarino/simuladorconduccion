#!/usr/bin/env python3
"""Check package integrity using only Python's standard library.

This performs semantic checks, not legal review or full JSON Schema validation.
The supplied schema is also available for consumers using a schema validator.
"""
from pathlib import Path
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import date

ROOT = Path(__file__).resolve().parents[1]
errors = []

def check(condition, message):
    if not condition:
        errors.append(message)

def read(relative):
    return json.loads((ROOT / relative).read_text(encoding='utf-8'))

def valid_date(value):
    try:
        date.fromisoformat(value)
        return True
    except (TypeError, ValueError):
        return False

def main():
    sources_list = read('data/sources.json')
    assets_list = read('data/assets.json')
    config = read('data/site-config.json')
    sources = {s['id']: s for s in sources_list}
    assets = {a['id']: a for a in assets_list}
    check(len(sources) == len(sources_list), 'Duplicate source IDs')
    check(len(assets) == len(assets_list), 'Duplicate asset IDs')
    for s in sources_list:
        check(s['url'].startswith('https://'), f"Non-HTTPS source: {s['id']}")
        check(valid_date(s['accessedAt']), f"Invalid source date: {s['id']}")
    for a in assets_list:
        check(a['src'].startswith('/images/questions/'), f"Unexpected asset path: {a['id']}")
        path = (ROOT / 'public' / a['src'].lstrip('/')).resolve()
        check(path.is_relative_to((ROOT / 'public').resolve()), f"Asset escapes public directory: {a['id']}")
        check(path.is_file(), f"Missing asset: {a['id']}")
        if path.is_file():
            tree = ET.parse(path)
            root = tree.getroot()
            check(root.tag == '{http://www.w3.org/2000/svg}svg', f"Not SVG: {a['id']}")
            check(root.get('width') == str(a['width']) and root.get('height') == str(a['height']), f"Dimensions disagree: {a['id']}")
            text = path.read_text()
            check('<script' not in text and 'href=' not in text, f"Unexpected active/external SVG content: {a['id']}")
        check(bool(a['alt'].strip()), f"Missing alt: {a['id']}")
    all_ids = set()
    used_assets = set()
    stats = []
    for j in config['jurisdictions']:
        bank = read('data/' + j['bankId'] + '.json')
        check(bank['bankId'] == j['bankId'], 'Bank ID mismatch')
        check(bank['schemaVersion'] == '1.0.0', 'Unknown schema version')
        questions = bank['questions']
        check(len(questions) == 20, f"Starter bank needs 20 questions: {j['bankId']}")
        prompts = set()
        positions = Counter()
        for q in questions:
            qid = q['id']
            check(qid not in all_ids, f'Duplicate question ID: {qid}')
            all_ids.add(qid)
            check(q['jurisdictionId'] == j['id'], f'Cross-jurisdiction question: {qid}')
            check(q['licenseClasses'] == ['B1'], f'Unexpected class scope: {qid}')
            normalized = re.sub(r'\s+', ' ', q['prompt'].strip().lower())
            check(normalized not in prompts, f'Duplicate prompt: {qid}')
            prompts.add(normalized)
            options = q['options']
            ids = [o['id'] for o in options]
            texts = [o['text'].strip().lower() for o in options]
            check(len(options) == 3 and len(set(ids)) == 3 and len(set(texts)) == 3, f'Invalid alternatives: {qid}')
            check(ids.count(q['correctOptionId']) == 1, f'Correct option unresolved: {qid}')
            if q['correctOptionId'] in ids:
                positions[ids.index(q['correctOptionId'])] += 1
            for field in ['prompt', 'explanation', 'topic']:
                check(bool(q[field].strip()), f'Empty {field}: {qid}')
            check(q['authorship'] == 'original-editorial', f'Unexpected authorship: {qid}')
            check(q['contentStatus'] == 'source-checked-draft', f'Unexpected review status: {qid}')
            check(q['humanReviewedAt'] is None and q['humanReviewer'] is None, f'Unverified human review: {qid}')
            check(valid_date(q['sourceCheckedAt']), f'Invalid check date: {qid}')
            check(q['version'] >= 1, f'Invalid version: {qid}')
            check(bool(q['sources']), f'No source: {qid}')
            for ref in q['sources']:
                check(ref['sourceId'] in sources, f'Missing source: {qid}')
                check(bool(ref['locator'].strip()), f'Missing source locator: {qid}')
                if ref['sourceId'] in sources:
                    check(sources[ref['sourceId']]['jurisdictionId'] == j['id'], f'Source jurisdiction mismatch: {qid}')
            if q['imageId'] is not None:
                check(q['imageId'] in assets, f'Unknown image: {qid}')
                used_assets.add(q['imageId'])
        check(len(positions) == 3, f'Correct answers concentrated in one position: {j["bankId"]}')
        stats.append({'bank':j['bankId'],'questions':len(questions),'illustratedQuestions':sum(q['imageId'] is not None for q in questions),'topics':len(set(q['topic'] for q in questions))})
    check(used_assets == set(assets), 'Unreferenced assets')
    check(config['officialExamMode']['enabled'] is False, 'Official mode enabled without verification')
    check(config['indexableProduction'] is False and config['siteUrl'] is None, 'Starter publication defaults changed')
    check(len(all_ids) == 40, 'Total must be 40 questions')
    if errors:
        print('\n'.join('ERROR: '+e for e in errors), file=sys.stderr)
        return 1
    print(json.dumps({'status':'PASS','totalQuestions':len(all_ids),'assets':len(assets),'banks':stats,'scope':'Structural and semantic data integrity only; no app, SEO or legal certification.'},ensure_ascii=False,indent=2))
    return 0

if __name__ == '__main__':
    try:
        sys.exit(main())
    except (KeyError, ValueError, OSError, ET.ParseError) as exc:
        print('ERROR: '+str(exc), file=sys.stderr)
        sys.exit(1)
