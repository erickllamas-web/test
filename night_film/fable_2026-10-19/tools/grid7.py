import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'predict.py')).read().split('print("\\n== (3)')[0])
print("== wider grid, sidereal-day span, integer cycles (camera velocity continuous at the loop)")
for cyc in [7.0, 8.0]:
    for amp in [60, 65, 70]:
        for base in [0, 10]:
            score_sweep((1440,base,amp,cyc),i_sid,f"pan1440 base{base} amp{amp} cyc{cyc}")
score_sweep((1080,0,65,7.0),i_sid,"pan1080 base0 amp65 cyc7.0")
score_sweep((1800,0,65,7.0),i_sid,"pan1800 base0 amp65 cyc7.0")
