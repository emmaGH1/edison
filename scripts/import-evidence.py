"""Import only the frozen development outputs to an ignored local bundle. No network."""
import argparse
import csv
import hashlib
import json
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPECTED = {
    'comparison.json': '52bddb6089eb2586add814c1fb1ed884e9627c7eec0803ec0922f59596734c9f',
    'decision-audit.json': '30c78e545ed607043616150075350f78c9eaa47d80325142cfafc44962ca9325',
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Authorized local frozen research directory')
    args = parser.parse_args()
    source = args.source.resolve()
    if not source.is_dir():
        parser.error('Source must be an existing directory')
    hashes = {}
    records = {}
    for name, expected in EXPECTED.items():
        raw = (source / 'jev-development' / name).read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if digest != expected:
            raise ValueError('Frozen source digest mismatch: ' + name)
        hashes[name] = digest
        records[name] = json.loads(raw)
    comparison, audit = records['comparison.json'], records['decision-audit.json']
    if comparison['holdout_read'] is not False or comparison['advance_gate_passed'] is not False:
        raise ValueError('Frozen evidence boundary changed')
    if len(audit) != 59 or sum(e['jev_accept'] for e in audit) != 23:
        raise ValueError('Entry counts changed')
    if len([e for e in audit if e['baseline_net_trade_return'] is not None]) != 55:
        raise ValueError('Completed-trade count changed')
    if any(not ('2021-01-01' <= e['signal_date'] <= '2024-12-31') for e in audit):
        raise ValueError('Outside development period')
    series = {}
    for policy, folder in [('crossover', 'native-research'), ('rule_filter', 'jev-development'), ('jev', 'jev-development'), ('buy_hold', 'native-research')]:
        path = source / folder / (policy + '-10bps-daily.csv')
        raw = path.read_bytes()
        hashes[path.name] = hashlib.sha256(raw).hexdigest()
        rows = list(csv.DictReader(raw.decode().splitlines()))
        if not rows or rows[0]['date'] != '2021-01-04' or rows[-1]['date'] != '2024-12-31':
            raise ValueError('Daily series period changed')
        if any(not ('2021-01-01' <= r['date'] <= '2024-12-31') for r in rows):
            raise ValueError('Outside development series')
        if abs(float(rows[-1]['equity']) - comparison['results'][policy + '-10bps']['final_equity_usd']) > 1e-6:
            raise ValueError('Daily series endpoint changed')
        month_ends = OrderedDict()
        for row in rows:
            month_ends[row['date'][:7]] = row
        series[policy] = [rows[0]] + list(month_ends.values())
    dates = [row['date'] for row in series['crossover']]
    if len(dates) != 49 or any([r['date'] for r in rows] != dates for rows in series.values()):
        raise ValueError('Series dates do not align')
    policies = list(series)
    allowed = {'event_id', 'symbol', 'signal_date', 'entry_date', 'rule_accept', 'jev_accept', 'reversed_order_accept', 'trend_choice', 'risk_choice', 'baseline_exit_date', 'baseline_net_trade_return'}
    if any(set(e) != allowed for e in audit):
        raise ValueError('Unexpected audit fields')
    payload = {
        'version': 'edison-evidence-v1', 'source_hashes': hashes,
        'period': {'start': '2021-01-01', 'end': '2024-12-31', 'layer': 'native-stock development'},
        'cost_bps_per_side': 10,
        'results': {p: comparison['results'][p + '-10bps'] for p in policies},
        'cost_scenarios': {str(c): {p: comparison['results'][p + '-' + str(c) + 'bps'] for p in policies} for c in [0, 5, 10, 20]},
        'audit': audit,
        'featured_event_ids': ['cd1b66d63c11dd53', '2e92b51cf70d42c8'],
        'equity': [{'date': date, **{p: float(series[p][i]['equity']) for p in policies}} for i, date in enumerate(dates)],
        **{key: comparison[key] for key in ['gate_checks', 'api', 'ex_post_exposure_diagnostics', 'advance_gate_passed', 'holdout_read']},
    }
    out = ROOT / '.edison-private'
    out.mkdir(exist_ok=True)
    raw = json.dumps(payload, indent=2, allow_nan=False) + '\n'
    (out / 'evidence.json').write_text(raw)
    (out / 'evidence.json.sha256').write_text(hashlib.sha256(raw.encode()).hexdigest() + '\n')
    print('Imported hash-checked local development evidence; no raw bars, network or reserved data accessed.')


if __name__ == '__main__':
    main()
