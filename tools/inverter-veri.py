#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""assets/inverter-veri.json üretici — İnverter hata kodları ve off-grid ayar rehberi verisi.

Kullanım:
  python3 tools/inverter-veri.py <kilavuz-verisi.json> <inverter-kodlari.json>            DRY-RUN (özet)
  python3 tools/inverter-veri.py <kilavuz-verisi.json> <inverter-kodlari.json> --uygula   assets/inverter-veri.json yazar
Girdi dosyaları repoda DEĞİLDİR (işletmenin kılavuz PDF'lerinden ve üretici belgelerinden çıkarılmış ham
aktarım); PDF'ler de repoya KONMAZ. Yayınlanan tek kaynak assets/inverter-veri.json'dur; yeni aile ya da
düzeltme ya girdiler yenilenip bu betikle ya da doğrudan o dosyada (test sayıları güncellenerek) yapılır.

KURALLAR (CLAUDE.md "İnverter hata kodları")
- Aileler BİRLEŞTİRİLMEZ: aynı numara farklı kılavuzda farklı anlam taşır (ör. 11: A'da PV aşırı gerilim,
  C'de şebeke röle hatası). Arama her zaman aile → (tür) → kod.
- Girdide olmayan kod, anlam ya da ayar EKLENMEZ. Çeviri olan satırda üreticinin özgün ifadesi de taşınır.
- KOD satırı belirsizse (uncertain) kılavuzun kendi ifadesiyle ve `u:1` işaretiyle yayınlanır.
- AYAR satırı belirsizse (program, gerilim, pin şeması) HİÇ yayınlanmaz (aşağıda DROP_* listeleri).
- Kılavuzda basılı yayıncı/tedarikçi adı ve iletişimi veriye ALINMAZ.
"""
import json, re, sys
APPLY='--uygula' in sys.argv
args=[a for a in sys.argv[1:] if not a.startswith('--')]
K=json.load(open(args[0],encoding='utf8')); W=json.load(open(args[1],encoding='utf8'))
M={m['id']:m for m in K['manuals']}
OWNER='işletmenin sağladığı kullanım kılavuzu'

def clean(t):
    """Aktarım dosyasının iç başvurularını okur diline çevir."""
    if t is None: return None
    t=str(t)
    for a,b in [("bkz. grid.output_source_priority","bkz. “Şebeke bağlıyken” sekmesi"),("(bkz. function_keys_timers)",""),("bkz. warnings (category=lithium_bms), ",""),
                ("(bkz. faults, category=parallel)","(paralel arıza kodları)"),("Hazır parametreler için bkz. charge_parameter_tables.lithium_without_bms (s.28-29)",""),("(bkz. programs)","")]:
        t=t.replace(a,b)
    return re.sub(r'\s+',' ',t).strip()

# ---------- web aileleri (üretici belgeleri) ----------
WEB=[  # (girdi sırası, kimlik, sayfa grubu, kısa ad, dil)
 (0,'deye-sg05lp1','deye','SUN-3.6K…10K-SG05LP1-EU-AM2-P (tek faz hibrit)','en'),
 (1,'deye-sg05lp3','deye','SUN-3K…12K-SG05LP3-EU-SM2 (üç faz hibrit)','en'),
 (4,'mexx-p4kw','mexxsun','MEXX-P4KW','tr'),
 (2,'mexx-p6kw','mexxsun','MEXX-P6KW','tr'),
 (3,'mexx-p12kw','mexxsun','MEXX-P12KW','tr'),
 (5,'sunon-iv-8kw','mexxsun','SUNON IV 8KW 48V 450VDC','en'),
 (6,'axpert-vm2-pf1','voltronic','Axpert VM II (PF1) 3KVA–5KVA','en'),
 (7,'axpert-mks','voltronic','Axpert MKS 1KVA–5KVA','en'),
 (8,'victron-mppt','victron','MPPT / Skylla / Inverter RS / Orion Smart hata kodları','en'),
 (9,'solis-grid-tied','solis','Şebeke bağlantılı (string) inverter alarm kodları','en'),
]
VERIFIED={'deye-sg05lp1':'Kaynak PDF yeniden açıldı; 19 satırın tamamı sayfa görüntüsüyle karşılaştırıldı (24 Kas 2026).',
 'deye-sg05lp3':'Kaynak PDF yeniden açıldı; 25 satırın tamamı sayfa görüntüsüyle karşılaştırıldı (24 Kas 2026).',
 'mexx-p4kw':'Kaynak PDF yeniden açıldı; 34 satırın tamamı sayfa metniyle karşılaştırıldı (24 Kas 2026).',
 'sunon-iv-8kw':'Kaynak PDF yeniden açıldı; 40 satırın tamamı sayfa görüntüsüyle karşılaştırıldı (24 Kas 2026).'}
fams=[]
for idx,fid,grp,name,lang in WEB:
    f=W['families'][idx]; rows=[]
    for r in f['codes']:
        o={'c':r['code'],'t':r['type'],'p':clean(r['page'])}
        if lang=='tr': o['m']=clean(r['meaning']); rem=clean(r['remedy'])
        else: o['m']=clean(r['anlam_tr']); o['o']=clean(r['meaning']); rem=clean(r['cozum_tr'])
        if rem: o['r']=rem
        if lang!='tr' and r['remedy'].strip(): o['ro']=clean(r['remedy'])
        rows.append(o)
    src={'t':f['manual'],'url':f['source_url'],'k':'web'}
    if fid in VERIFIED: src['v']=VERIFIED[fid]
    if fid=='mexx-p12kw': src['x']='Kodlar, işletmenin sağladığı MEXX-P12KW V1.1 kılavuzundaki tabloyla satır satır aynıdır.'
    if fid=='deye-sg05lp3': src['x']='Deye kılavuzunun mexxsun.com üzerinde yayınlanan kopyası.'
    fams.append({'id':fid,'g':grp,'brand':f['brand'],'name':name,'lang':lang,'src':src,'codes':rows})
# B kılavuzu ile web MEXX-P12KW aynı olmalı (aynı model): farklıysa dur
web12={(r['type'],r['code']):r['meaning'].strip() for r in W['families'][3]['codes']}
own12={('fault',r['code']):r['meaning_orig'].strip() for r in M['B']['faults']}; own12.update({('alarm',r['code']):r['meaning_orig'].strip() for r in M['B']['warnings']})
assert web12==own12,'MEXX-P12KW: web ve işletme kılavuzu tabloları farklı'
u509=[r for r in M['B']['faults'] if r['code']=='509'][0]
for r in fams[4]['codes']:
    if r['c']=='509' and r['t']=='fault': r['u']=1; r['n']=clean(u509['note'])

# ---------- işletmenin sağladığı A ve C kılavuzları ----------
def own_rows(m):
    out=[]
    for sec,t in (('faults','fault'),('warnings','warning')):
        for r in m.get(sec,[]):
            o={'c':r['code'],'t':t,'m':clean(r['meaning_orig']),'p':'s.%s'%r['page']}
            if r.get('display'): o['d']=clean(r['display'])
            if r.get('remedy_tr'): o['r']=clean(r['remedy_tr'])
            if r.get('buzzer'): o['b']=clean(r['buzzer'])
            if r.get('note'): o['n']=clean(r['note'])
            if r.get('uncertain'): o['u']=1
            if r.get('category'): o['k']={'parallel':'paralel çalışma','lithium_bms':'lityum akü (BMS)'}.get(r['category'],r['category'])
            out.append(o)
    for sec,lab in (('status_codes_parallel','paralel durum kodu'),('usb_error_codes','USB işlev hata kodu')):
        for r in m.get(sec,[]):
            o={'c':r['code'],'t':'info','m':clean(r['meaning_tr']),'p':'s.%s'%r['page'],'k':lab}
            if r.get('note'): o['n']=clean(r['note'])
            if r.get('uncertain'): o['u']=1
            out.append(o)
    return out
A,B,C=M['A'],M['B'],M['C']
T_A='Akıllı İnvertör Kullanım Kılavuzu — 3.6KW / 6.5KW / 7.2KW Solar Inverter / Şarj Cihazı'
T_C='1KVA-5KVA Inverter / Charger — Akıllı İnvertör Kullanım Klavuzu'
T_B='MEXX-P12KW Tam Sinüs Akıllı Inverter Kullanım Kılavuzu'
fams.append({'id':'akilli-36-72kw','g':'akilli','brand':'Akıllı inverter (kılavuzda marka basılı değil)','name':'3,6 / 6,5 / 7,2 kW akıllı inverter (kılavuz Sürüm 1.5)','lang':'tr',
  'src':{'t':T_A,'rev':'Sürüm 1.5','k':'owner','x':'Kılavuz büyük ölçüde makine çevirisidir; satırlar kılavuzun kendi ifadesiyle verilir, köşeli parantezler aktaranın açıklamasıdır.'},'codes':own_rows(A)})
fams.append({'id':'akilli-1-5kva','g':'akilli','brand':'Akıllı inverter (kılavuzda marka basılı değil)','name':'1–5 kVA akıllı inverter','lang':'tr',
  'src':{'t':T_C,'k':'owner','x':'Kılavuzda sürüm numarası basılı değil.'},'codes':own_rows(C)})

# ---------- ayar rehberi (yalnız A, B, C) — belirsiz satırlar yayınlanmaz ----------
dropped=[]
def programs(m,mid):
    out=[]
    for r in m['programs']:
        if r.get('uncertain'): dropped.append('%s program %s (%s): %s'%(mid,r['no'],r['name_tr'][:60],(r.get('note') or '')[:140])); continue
        o={'no':r['no'],'name':clean(r['name_tr']),'p':'s.%s'%r['page']}
        if r.get('options'): o['opt']=[[clean(x['code']),clean(x['text_tr'])] for x in r['options']]
        for a,b in (('default','def'),('range','rng'),('notes_tr','note'),('menu','menu')):
            if r.get(a): o[b]=clean(r[a])
        out.append(o)
    return out
def item(label,text,page=None):
    text=[clean(x) for x in (text if isinstance(text,list) else [text]) if x and clean(x)]
    o={'k':label,'v':text}
    if page: o['p']='s.%s'%page
    return o
def opts(d): return ['%s — %s'%(k,v) for k,v in d.items()]
L,G={},{}
# --- A
la,ga=A['lithium'],A['grid']
dropped.append('A lityum: BMS portu RJ45 pin şeması (pin 6 ve 7 adları makine çevirisinde bozuk) — tablo tümüyle çıkarıldı')
dropped.append("A lityum: LCD 'bnS / P03 / G01' ekran açıklaması (çeviri bozuk) — çıkarıldı")
L['A']=[item('Akü tipi seçenekleri (program 05)',['%s — %s (s.%s)'%(x['code'],x['text_tr'],x['page']) for x in la['supported_battery_type_options_program_05']]),
 item('BMS haberleşmesi varken',la['programs_to_set']['with_bms_communication']),
 item('BMS haberleşmesi yokken',la['programs_to_set']['without_bms_communication']),
 item('İlgili programların aralıkları',['Program %s — %s'%(k,v) for k,v in la['programs_to_set']['related_programs_ranges'].items()]),
 item('Haberleşme portu ve kablo',[la['communication']['ports'],la['communication']['cable'],la['communication']['cable_function'],la['communication']['pylontech_dip'],la['communication']['lio_id_switch']]),
]+[item('Kurulum adımları: '+k,v) for k,v in la['setup_steps'].items() if isinstance(v,list)]+[
 item('Paralel sistemde',la['setup_steps']['parallel_note']),
 item('Lityum akü uyarı kodları',la['lithium_codes']),
 item('Akü aktivasyon işlevi',la['activation_function']),
 item('Güvenlik',la['safety'])]
G['A']=[item('Çıkış kaynağı önceliği (program %s)'%ga['output_source_priority']['program'],opts(ga['output_source_priority']['options'])+[ga['output_source_priority']['line_mode_notes']],ga['output_source_priority']['page']),
 item('Şebekeye dönüş noktası (program %s)'%ga['back_to_utility_point']['program'],ga['back_to_utility_point']['text'],ga['back_to_utility_point']['page']),
 item('Aküye dönüş noktası (program %s)'%ga['back_to_battery_point']['program'],ga['back_to_battery_point']['text'],ga['back_to_battery_point']['page']),
 item('Şarj kaynağı önceliği (program %s)'%ga['charger_source_priority']['program'],opts(ga['charger_source_priority']['options'])+[ga['charger_source_priority']['note']],ga['charger_source_priority']['page']),
 item('AC giriş voltajı aralığı (program %s)'%ga['ac_input_range']['program'],['APL — '+ga['ac_input_range']['APL'],'UPS — '+ga['ac_input_range']['UPS'],ga['ac_input_range']['spec_table']],ga['ac_input_range']['page']),
 item('Şarj akımı (program 02 ve 11)',['Program 02 (toplam) — '+ga['max_charging_current']['program_02_total'],'Program 11 (şebeke) — '+ga['max_charging_current']['program_11_utility']],ga['max_charging_current']['page']),
 item('Aşırı yükte şebekeye geçiş (program %s)'%ga['overload_bypass']['program'],ga['overload_bypass']['text'],ga['overload_bypass']['page']),
 item('En yüksek deşarj akımı (program %s)'%ga['max_discharge_current']['program'],ga['max_discharge_current']['text'],ga['max_discharge_current']['page']),
 item('Şebeke varken düşük DC kesme (program %s)'%ga['low_dc_cutoff_with_grid']['program'],ga['low_dc_cutoff_with_grid']['text'],ga['low_dc_cutoff_with_grid']['page']),
 item('Şebekeye besleme (satış)',ga['grid_feed_in']['text'],ga['grid_feed_in']['page']),
 item('Çıkış voltajı ve frekansı',ga['output_voltage_frequency']),
 item('Zamanlayıcılar',ga['timers']),
 item('Şebeke var ama cihaz akü modunda (sorun giderme)',ga['troubleshooting_grid']),
 item('Kuru kontak',ga['dry_contact']),
 item('Paralel çalışma',[ga['parallel']['capability'],ga['parallel']['setting']],ga['parallel']['pages'])]
# --- B
lb,gb=B['lithium'],B['grid']
DROP_B=('Şebeke yok iken deşarj durdurma SOC','Şebekeden şarj akım limiti','Şebekeden Şarj Akım Limiti','En düşük voltaj','charge_parameter_tables')
def keep(xs):
    out=[]
    for x in xs:
        if any(d in x for d in DROP_B): dropped.append('B lityum satırı (belirsiz programla ilgili): '+x[:110])
        else: out.append(x)
    return out
dropped+= ['B: şarj parametreleri tablosu (kurşun-asit, s.27-28) — USER sütunu ve SLD/FLD değerleri ayar tablosuyla çelişiyor; tablo tümüyle çıkarıldı',
 'B lityum: L14/L15/L16 ve N13/N14 alt türlerinin varsayılan şarj voltajları (belirsiz "akü alt türü" satırında) — yalnız adları verildi',
 'B şebeke: şebekeye besleme (etkinleştirme, güç ayarı, CT) — kılavuzun "şebekeden bağımsız cihaz" uyarısıyla bağdaşmıyor (belirsiz); çıkarıldı',
 'B şebeke: şebekeden şarj akım limiti (metin 60 A, ekran 210) — çıkarıldı',
 'B şebeke: şebeke yokken çıkış voltajı/frekansı satırı (etiket hatalı basılmış) — çıkarıldı',
 'B şebeke: çift çıkış / kritik olmayan yük bölümü (belirsiz) — çıkarıldı',
 'B paralel: üç faz örnek ekranları, haberleşme portu yönü ve paralel arıza kodları notu (çelişkili) — çıkarıldı']
L['B']=[item('Akü tipi seçenekleri',['%s — %s (s.%s)'%(x['option'],x['text_tr'],x['page']) for x in lb['supported_battery_types'] if x['option'] in ('Lityum (Varsayılan)','Lityum İletişimsiz')]),
 item('BMS haberleşmesi varken',keep(lb['settings_with_bms_communication'])),
 item('BMS haberleşmesi yokken',keep(lb['settings_without_bms_communication'])),
 item('Haberleşme portu',[lb['communication']['text'],lb['communication']['status_icon']]),
 item('BMS portu RJ45 pinleri',['Pin %s — %s'%(x['pin'],x['def']) for x in lb['communication']['pinout_rj45']],lb['communication']['pinout_page']),
 item('Geçiş voltajları hakkında',lb['voltage_switch_points_note']),
 item('Lityumla ilgili arıza ve alarm kodları',lb['lithium_codes']['faults']+lb['lithium_codes']['alarms'],lb['lithium_codes']['page']),
 item('Akü aktivasyon (uyandırma) işlevi',lb['activation_function']),
 item('Devreye alma adımları',lb['setup_steps'])]
assert not any(x.get('uncertain') for x in lb['communication']['pinout_rj45'])
G['B']=[item('Güç kaynak önceliği',opts(gb['output_source_priority']['options']),gb['output_source_priority']['page']),
 item('Şarj kaynak önceliği',opts(gb['charger_source_priority']['options']),gb['charger_source_priority']['page']),
 item('Şebekeye dönüş noktası',['Kurşun-asit — '+gb['back_to_utility_point']['lead_acid'],'Lityum (BMS) — '+gb['back_to_utility_point']['lithium_bms']]),
 item('Aküye dönüş noktası',['Kurşun-asit — '+gb['back_to_battery_point']['lead_acid'],'Lityum (BMS) — '+gb['back_to_battery_point']['lithium_bms']]),
 item('AC giriş aralığı (AC Modu)',['APL — '+gb['ac_input_range']['APL'],'UPS — '+gb['ac_input_range']['UPS'],gb['ac_input_range']['spec_table']],gb['ac_input_range']['page']),
 item('Bypass durumu',gb['bypass']['text'],gb['bypass']['page']),
 item('Aşırı yük',gb['overload']['text'],gb['overload']['page']),
 item('Jeneratör girişi',gb['generator']['text'],gb['generator']['page']),
 item('Paralel çalışma',[gb['parallel']['capability']]+gb['parallel']['settings']+[gb['parallel']['single_phase_example']],gb['parallel']['pages'])]
# --- C
lc,gc=C['lithium'],C['grid']
dropped+=['C lityum: kullanıcı tanımlı akü programları 26, 27, 29 (program tablosunda belirsiz) — çıkarıldı','C şebeke: paralel çalışma (yarım İngilizce tablo, belirsiz) — çıkarıldı']
L['C']=[item('Lityum akü desteği',lc['text']),item('Kılavuzun akü uyarıları',['%s (s.%s)'%(x['text'],x['page']) for x in lc['battery_statements']])]
G['C']=[item('Çıkış kaynağı önceliği (program %s)'%gc['output_source_priority']['program'],opts(gc['output_source_priority']['options']),gc['output_source_priority']['page']),
 item('Şebekeye dönüş noktası (program %s)'%gc['back_to_utility_point']['program'],gc['back_to_utility_point']['text'],gc['back_to_utility_point']['page']),
 item('Aküye dönüş noktası (program %s)'%gc['back_to_battery_point']['program'],gc['back_to_battery_point']['text'],gc['back_to_battery_point']['page']),
 item('Şarj kaynağı önceliği (program %s)'%gc['charger_source_priority']['program'],opts(gc['charger_source_priority']['options'])+[gc['charger_source_priority']['note']],gc['charger_source_priority']['page']),
 item('AC giriş voltaj aralığı (program %s)'%gc['ac_input_range']['program'],['APL — '+gc['ac_input_range']['APL'],'UPS — '+gc['ac_input_range']['UPS'],gc['ac_input_range']['spec_table']],gc['ac_input_range']['page']),
 item('Şarj akımı (program 02 ve 11)',['Program 02 (toplam) — '+gc['max_charging_current']['program_02_total'],'Program 11 (şebeke) — '+gc['max_charging_current']['program_11_utility'],gc['max_charging_current']['spec']],gc['max_charging_current']['page']),
 item('Aşırı yükte şebekeye geçiş (program %s)'%gc['overload_bypass']['program'],gc['overload_bypass']['text'],gc['overload_bypass']['page']),
 item('Güç tasarrufu modu (program %s)'%gc['power_saving']['program'],gc['power_saving']['text'],gc['power_saving']['page']),
 item('Şebekeye besleme (satış)',gc['grid_feed_in']['text']),
 item('Aküsüz çalışma',gc['battery_less_operation']),
 item('Şebeke var ama cihaz akü modunda (sorun giderme)',gc['troubleshooting_grid']),
 item('Kuru kontak',gc['dry_contact'])]
settings=[
 {'id':'A','fam':'akilli-36-72kw','name':'3,6 / 6,5 / 7,2 kW akıllı inverter (kılavuz Sürüm 1.5)','src':{'t':T_A,'rev':'Sürüm 1.5','k':'owner'},'programs':programs(A,'A'),'lithium':L['A'],'grid':G['A']},
 {'id':'B','fam':'mexx-p12kw','name':'MEXX-P12KW (kılavuz V1.1)','src':{'t':T_B,'rev':'Off-Grid İnverter V1.1','k':'owner'},'programs':programs(B,'B'),'lithium':L['B'],'grid':G['B']},
 {'id':'C','fam':'akilli-1-5kva','name':'1–5 kVA akıllı inverter','src':{'t':T_C,'k':'owner'},'programs':programs(C,'C'),'lithium':L['C'],'grid':G['C']}]
out={'v':1,'generated':W.get('generated'),'owner':OWNER,'families':fams,'settings':settings}
s=json.dumps(out,ensure_ascii=False,separators=(',',':'))
low=s.lower()
for banned in ('atakale','425 2200','tommatech','abax','watchpower','category=','charge_parameter_tables','function_keys','"uncertain"'): assert banned not in low,banned
for f in fams: print('%-16s %-10s %3d satır  türler=%s  belirsiz=%d'%(f['id'],f['g'],len(f['codes']),sorted(set(r['t'] for r in f['codes'])),sum(1 for r in f['codes'] if r.get('u'))))
print('toplam',sum(len(f['codes']) for f in fams),'| programlar',[(x['id'],len(x['programs'])) for x in settings],'| boyut',len(s.encode('utf8')))
print('--- YAYINLANMAYAN AYARLAR (%d)'%len(dropped)); print('\n'.join(' - '+d for d in dropped))
if APPLY:
    import os
    open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets','inverter-veri.json'),'w',encoding='utf8').write(s+'\n'); print('YAZILDI: assets/inverter-veri.json')
