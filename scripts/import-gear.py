"""Converts the family gear workbook (seed/family-gear.xlsx) into src/data/seed.json.
Status emoji in the sheet map to app status codes."""
import json, re, openpyxl
wb = openpyxl.load_workbook('seed/family-gear.xlsx', data_only=True)
ST = {'✅': 'have', '🏠': 'home', '⬜': 'check', '🛒': 'buy', '🔁': 'per_trip'}
def st(v):
    v = str(v or '')
    for k, c in ST.items():
        if k in v: return c
    return 'check'
def rows(ws, start):
    for r in ws.iter_rows(min_row=start, values_only=True):
        if r[0] is None: continue
        yield r
boxes = [
 dict(id='b01', name='תיק אוהל והקמה', color='#2f5d3a', category='tents', dims=[117,23,25], volume=None, kind='bag', purpose='כל ציוד ההקמה ביחידה אחת', note='המידה היא אינדיקציה למארז האוהל'),
 dict(id='b02', name='ארגז חשמל ותאורה', color='#d9822b', category='power', dims=[45,35,30], volume='40-45', kind='box', purpose='חשמל, אוורור, טעינה ותאורה', note='בסיס 45×35 כדי לאפשר הערמה'),
 dict(id='b03', name='ארגז מטבח', color='#a0522d', category='kitchen', dims=[45,35,35], volume='50-60', kind='box', purpose='כלי אוכל וציוד מטבח יבש', note='ללא מזון קר — הצידנית בנפרד'),
 dict(id='b04', name='ארגז ניקיון והיגיינה', color='#3d7ea6', category='hygiene', dims=[45,35,25], volume='30-40', kind='box', purpose='ניקיון, רחצה, היגיינה ועזרה ראשונה', note='העדפה למכסה ננעל'),
 dict(id='b05', name='תיק רך ביגוד ושינה', color='#7a6a9e', category='clothing', dims=[65,40,35], volume='80-100', kind='bag', purpose='ביגוד, נעליים, מצעים וציוד רך', note='תיק גמיש עדיף לניצול חללים ברכב'),
]
items = []
def add(**k):
    k['id'] = 'g%03d' % (len(items) + 1); items.append(k)
# 01 tent bag
for r in rows(wb['01 תיק אוהל'], 5):
    add(name=r[0], qty=r[1] or 1, status=st(r[2]), category='tents', boxId='b01', spot=r[4], notes=r[5])
# 02 power
for r in rows(wb['02 ארגז חשמל'], 5):
    add(name=r[0], qty=r[1] or 1, status=st(r[2]), category='power', boxId='b02', spot=r[4], charge=(r[5] == 'כן'), notes=r[6])
# 03 kitchen
for r in rows(wb['03 ארגז מטבח'], 5):
    if 'צידנית' in r[0] or 'מים מינרליים' in r[0]: continue  # listed as big gear
    cat = 'food' if r[4] == 'לפי טיול' else 'kitchen'
    add(name=r[0], qty=r[1] or 1, status=st(r[2]), category=cat, boxId='b03', perTrip=(r[4] == 'לפי טיול'), notes=r[5])
# 04 hygiene
for r in rows(wb['04 ניקיון והיגיינה'], 5):
    name = r[0]
    cat = 'firstaid' if ('עזרה ראשונה' in name or 'תרופות' in name) else ('cleaning' if any(w in name for w in ['מטאטא','יעה','זבל','כלים','סופג','מטליות','כביסה','רטובים']) else 'hygiene')
    add(name=name, qty=r[1] or 1, owner=r[2], status=st(r[3]), category=cat, boxId='b04', spot=r[5], notes=r[6])
# big gear (overview sheet)
ws = wb['סקירה כללית']; started = False
for r in ws.iter_rows(min_row=1, values_only=True):
    if r[0] == 'ציוד גדול / נפרד': started = True; continue
    if not started or r[0] is None: continue
    name = r[0]
    if name.startswith('Aztec') or name.startswith('יריעת PE') or name.startswith('Tarp'): continue  # already in tent bag
    cat = {'מזרן': 'sleep', 'מחצלת': 'furniture', 'קרחומים': 'cooling', 'צידנית': 'cooling', 'שולחן': 'furniture', 'כיסאות': 'furniture', 'שישיות': 'food', 'מכל': 'cleaning'}
    c = next((v for k, v in cat.items() if k in name), 'misc')
    add(name=name, qty=r[1] or 1, status=st(r[2]), category=c, boxId=None, spot=r[4], notes=r[5], big=True)
# shared sleeping (sheet 05 bottom)
ws = wb['05 ביגוד ושינה']; personal = []; members = []
for r in ws.iter_rows(min_row=5, values_only=True):
    if r[0] is None or r[0] == 'ציוד שינה משותף': continue
    if r[0] == 'משותף':
        if 'מזרן' in r[1]: continue
        add(name=r[1], qty=r[2] or 1, status=st(r[3]), category='sleep', boxId='b05', spot=r[5], notes=r[7]); continue
    if r[0] not in members: members.append(r[0])
    if r[0] == members[0]:
        personal.append(dict(name=r[1], hot=r[2], cold=r[3], sub=r[6], notes=r[7]))
ov = list(wb['סקירה כללית'].iter_rows(min_row=5, max_row=9, values_only=True))
fam = []
# Names and ages from the spreadsheet stay private: the public bundle ships a generic example family.
fam = [dict(id='m1', name='מבוגר/ת 1', gender='f', age=38, role='adult'), dict(id='m2', name='מבוגר/ת 2', gender='m', age=40, role='adult'),
       dict(id='m3', name='ילד/ה 1', gender='f', age=10, role='child'), dict(id='m4', name='ילד/ה 2', gender='m', age=6, role='child')]
tasks = []
for r in wb['06 לפני יציאה'].iter_rows(min_row=4, values_only=True):
    if r[1]: tasks.append(dict(when=r[0], text=r[1]))
for it in items:
    for k in list(it):
        if it[k] is None: del it[k]
for it in personal:
    for k in list(it):
        if it[k] is None: del it[k]
json.dump(dict(members=fam, boxes=boxes, items=items, personalTemplate=personal, tasks=tasks), open('src/data/seed.json', 'w'), ensure_ascii=False, indent=1)
print(len(items), 'items', len(personal), 'personal', fam, len(tasks), 'tasks')
