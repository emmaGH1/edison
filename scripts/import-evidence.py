"""Import validated HF/IEX-derived outputs to an ignored local bundle. No network."""
import argparse
import hashlib
import json
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPECTED = {
    'comparison.json': '303206e8c5c5a42f3379a220f5eb3f6d453ae87db2e438173a0f17df699a6128',
    'decision-audit.json': 'c0db6ba2f540334d960d8e975e59cb55fb20e90bdc22d7d4ccb33ca831960e56',
}
VALIDATION_DIGEST = '5db7637a51fc3a5320a7851bfe657d9e0017897ccadf628e8ac45f5adfce5394'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Validated private hf-iex-v2 directory')
    args = parser.parse_args()
    source = args.source.resolve()
    performance = source / 'performance'
    if not performance.is_dir():
        parser.error('Source must contain a performance directory')
    validation_raw = (source / 'validation.json').read_bytes()
    if hashlib.sha256(validation_raw).hexdigest() != VALIDATION_DIGEST:
        raise ValueError('Frozen validation digest mismatch')
    validation = json.loads(validation_raw)
    if validation.get('validated') is not True:
        raise ValueError('Private result validation is incomplete')
    hashes = {}
    hashes['validation.json'] = VALIDATION_DIGEST
    records = {}
    for name, expected in EXPECTED.items():
        raw = (performance / name).read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if digest != expected or validation['output_sha256'].get('performance/' + name) != digest:
            raise ValueError('Frozen source digest mismatch: ' + name)
        hashes[name] = digest
        records[name] = json.loads(raw)
    comparison, audit = records['comparison.json'], records['decision-audit.json']
    if comparison['market_price_reserve_read'] is not False or comparison['corporate_action_reserve_fully_unopened'] is not False or comparison['advance_gate_passed'] is not False:
        raise ValueError('Frozen evidence boundary changed')
    if len(audit) != 37 or sum(e['jev_accept'] for e in audit) != 10:
        raise ValueError('Entry counts changed')
    if len([e for e in audit if e['baseline_net_trade_return'] is not None]) != 34:
        raise ValueError('Completed-trade count changed')
    if any(not ('2022-06-01' <= e['signal_date'] <= '2024-11-29') for e in audit):
        raise ValueError('Outside development period')
    series = {}
    for policy in ['crossover', 'rule_filter', 'jev', 'buy_hold']:
        path = performance / (policy + '-10bps.json')
        raw = path.read_bytes()
        hashes[path.name] = hashlib.sha256(raw).hexdigest()
        if validation['output_sha256'].get('performance/' + path.name) != hashes[path.name]:
            raise ValueError('Validated run digest mismatch')
        rows = json.loads(raw)['daily']
        if len(rows) != 629 or rows[0]['date'] != '2022-06-01' or rows[-1]['date'] != '2024-11-29':
            raise ValueError('Daily series period changed')
        if any(not ('2022-06-01' <= r['date'] <= '2024-11-29') for r in rows):
            raise ValueError('Outside development series')
        if abs(float(rows[-1]['equity']) - comparison['results'][policy + '-10bps']['final_equity_usd']) > 1e-6:
            raise ValueError('Daily series endpoint changed')
        month_ends = OrderedDict()
        for row in rows:
            month_ends[row['date'][:7]] = row
        series[policy] = [rows[0]] + list(month_ends.values())
    dates = [row['date'] for row in series['crossover']]
    if len(dates) != 31 or any([r['date'] for r in rows] != dates for rows in series.values()):
        raise ValueError('Series dates do not align')
    policies = list(series)
    allowed = {'event_id', 'symbol', 'signal_date', 'entry_date', 'rule_accept', 'jev_accept', 'reversed_order_accept', 'trend_choice', 'risk_choice', 'baseline_exit_date', 'baseline_net_trade_return'}
    if any(set(e) != allowed for e in audit):
        raise ValueError('Unexpected audit fields')
    payload = {
        'version': 'edison-evidence-v2', 'source_hashes': hashes,
        'period': {'start': '2022-06-01', 'end': '2024-11-29', 'layer': 'IEX-only native-stock development'},
        'source': {
            'provider': 'HF Data Library', 'venue': 'IEX-only', 'version': 'raw 1-minute bars',
            'license': 'CC BY 4.0 compilation/documentation',
            'attribution': 'Data provided for free by IEX. By accessing or using IEX Historical Data, you agree to the IEX Historical Data Terms of Use.'},
        'cost_bps_per_side': 10,
        'results': {p: comparison['results'][p + '-10bps'] for p in policies},
        'cost_scenarios': {str(c): {p: comparison['results'][p + '-' + str(c) + 'bps'] for p in policies} for c in [0, 5, 10, 20]},
        'audit': audit,
        'featured_event_ids': ['baf34685390bf777', 'fbea34e2a73f6779'],
        'equity': [{'date': date, **{p: float(series[p][i]['equity']) for p in policies}} for i, date in enumerate(dates)],
        **{key: comparison[key] for key in ['gate_checks', 'api', 'ex_post_exposure_diagnostics', 'advance_gate_passed', 'market_price_reserve_read', 'corporate_action_reserve_fully_unopened']},
    }
    out = ROOT / '.edison-private'
    out.mkdir(exist_ok=True)
    raw = json.dumps(payload, indent=2, allow_nan=False) + '\n'
    (out / 'evidence.json').write_text(raw)
    (out / 'evidence.json.sha256').write_text(hashlib.sha256(raw.encode()).hexdigest() + '\n')
    print('Imported validated HF/IEX-only derived evidence; no raw bars or network accessed.')


if __name__ == '__main__':
    main()
