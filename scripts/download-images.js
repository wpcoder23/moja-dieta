const https = require('https');
const fs = require('fs');

function dl(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      if(res.statusCode===301||res.statusCode===302) return dl(res.headers.location,dest).then(resolve).catch(reject);
      if(res.statusCode!==200) { reject(new Error('HTTP '+res.statusCode)); return; }
      const c=[]; res.on('data',d=>c.push(d)); res.on('end',()=>{const b=Buffer.concat(c);fs.writeFileSync(dest,b);resolve(b.length);});
    }).on('error',reject);
  });
}

const IMAGES = {
  'stek-wolowy': 'https://images.pexels.com/photos/1251208/pexels-photo-1251208.jpeg?auto=compress&cs=tinysrgb&w=300',
  'karkowka-wieprzowa': 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=300',
  'piers-kurczaka': 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=300',
  'piers-indyka': 'https://images.pexels.com/photos/5848568/pexels-photo-5848568.jpeg?auto=compress&cs=tinysrgb&w=300',
  'watrobka-wolowa': 'https://images.pexels.com/photos/8477434/pexels-photo-8477434.jpeg?auto=compress&cs=tinysrgb&w=300',
  'watrobka-drobiowa': 'https://images.pexels.com/photos/5718071/pexels-photo-5718071.jpeg?auto=compress&cs=tinysrgb&w=300',
  'losos': 'https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=300',
  'sardynki': 'https://images.pexels.com/photos/8969756/pexels-photo-8969756.jpeg?auto=compress&cs=tinysrgb&w=300',
  'makrela': 'https://images.pexels.com/photos/3843224/pexels-photo-3843224.jpeg?auto=compress&cs=tinysrgb&w=300',
  'sledz': 'https://images.pexels.com/photos/8969237/pexels-photo-8969237.jpeg?auto=compress&cs=tinysrgb&w=300',
  'jajka': 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300',
  'mleko-kozie': 'https://images.pexels.com/photos/4397920/pexels-photo-4397920.jpeg?auto=compress&cs=tinysrgb&w=300',
  'ser-gouda': 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=300',
  'twarog': 'https://images.pexels.com/photos/4198018/pexels-photo-4198018.jpeg?auto=compress&cs=tinysrgb&w=300',
  'mascarpone': 'https://images.pexels.com/photos/4198024/pexels-photo-4198024.jpeg?auto=compress&cs=tinysrgb&w=300',
  'bataty': 'https://images.pexels.com/photos/89247/pexels-photo-89247.jpeg?auto=compress&cs=tinysrgb&w=300',
  'ziemniaki': 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&cs=tinysrgb&w=300',
  'brokuly': 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=300',
  'kalafior': 'https://images.pexels.com/photos/6316515/pexels-photo-6316515.jpeg?auto=compress&cs=tinysrgb&w=300',
  'brukselka': 'https://images.pexels.com/photos/41171/brussels-sprouts-sprouts-cabbage-grocery-41171.jpeg?auto=compress&cs=tinysrgb&w=300',
  'szparagi': 'https://images.pexels.com/photos/351679/pexels-photo-351679.jpeg?auto=compress&cs=tinysrgb&w=300',
  'marchewka': 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300',
  'kapusta': 'https://images.pexels.com/photos/2518893/pexels-photo-2518893.jpeg?auto=compress&cs=tinysrgb&w=300',
  'papryka-bio': 'https://images.pexels.com/photos/594137/pexels-photo-594137.jpeg?auto=compress&cs=tinysrgb&w=300',
  'cebula': 'https://images.pexels.com/photos/175414/pexels-photo-175414.jpeg?auto=compress&cs=tinysrgb&w=300',
  'czosnek': 'https://images.pexels.com/photos/928251/pexels-photo-928251.jpeg?auto=compress&cs=tinysrgb&w=300',
  'jagody': 'https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&cs=tinysrgb&w=300',
  'maliny': 'https://images.pexels.com/photos/1030865/pexels-photo-1030865.jpeg?auto=compress&cs=tinysrgb&w=300',
  'truskawki': 'https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg?auto=compress&cs=tinysrgb&w=300',
  'awokado': 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&cs=tinysrgb&w=300',
  'banan': 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=300',
  'kiwi': 'https://images.pexels.com/photos/867349/pexels-photo-867349.jpeg?auto=compress&cs=tinysrgb&w=300',
  'ananas': 'https://images.pexels.com/photos/947879/pexels-photo-947879.jpeg?auto=compress&cs=tinysrgb&w=300',
  'chia': 'https://images.pexels.com/photos/4725744/pexels-photo-4725744.jpeg?auto=compress&cs=tinysrgb&w=300',
  'siemie-lniane': 'https://images.pexels.com/photos/7615464/pexels-photo-7615464.jpeg?auto=compress&cs=tinysrgb&w=300',
  'oliwa': 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=300',
  'maslo': 'https://images.pexels.com/photos/4110541/pexels-photo-4110541.jpeg?auto=compress&cs=tinysrgb&w=300',
  'smalec': 'https://images.pexels.com/photos/6941026/pexels-photo-6941026.jpeg?auto=compress&cs=tinysrgb&w=300',
  'olej-kokosowy': 'https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg?auto=compress&cs=tinysrgb&w=300',
  'kiszona-kapusta': 'https://images.pexels.com/photos/8744363/pexels-photo-8744363.jpeg?auto=compress&cs=tinysrgb&w=300',
  'sok-burak': 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg?auto=compress&cs=tinysrgb&w=300',
  'ogorki-kiszone': 'https://images.pexels.com/photos/5503107/pexels-photo-5503107.jpeg?auto=compress&cs=tinysrgb&w=300',
  'kurkuma': 'https://images.pexels.com/photos/4198370/pexels-photo-4198370.jpeg?auto=compress&cs=tinysrgb&w=300',
  'pieprz': 'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=300',
  'imbir': 'https://images.pexels.com/photos/161556/ginger-plant-asia-rhizome-161556.jpeg?auto=compress&cs=tinysrgb&w=300',
  'cynamon': 'https://images.pexels.com/photos/6087597/pexels-photo-6087597.jpeg?auto=compress&cs=tinysrgb&w=300',
  'tymianek': 'https://images.pexels.com/photos/4198949/pexels-photo-4198949.jpeg?auto=compress&cs=tinysrgb&w=300',
  'oregano': 'https://images.pexels.com/photos/4198948/pexels-photo-4198948.jpeg?auto=compress&cs=tinysrgb&w=300',
  'pietruszka': 'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=300',
  'czekolada-85': 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=300',
  'miod': 'https://images.pexels.com/photos/1872903/pexels-photo-1872903.jpeg?auto=compress&cs=tinysrgb&w=300',
  'zielona-herbata': 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=300',
  'bulion-kostny': 'https://images.pexels.com/photos/5409020/pexels-photo-5409020.jpeg?auto=compress&cs=tinysrgb&w=300',
  'acerola': 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=300',
  'sol-jodowana': 'https://images.pexels.com/photos/6941010/pexels-photo-6941010.jpeg?auto=compress&cs=tinysrgb&w=300',
};

async function run() {
  let ok = 0, fail = 0;
  for (const [slug, url] of Object.entries(IMAGES)) {
    try {
      const size = await dl(url, 'public/products/' + slug + '.jpg');
      if (size > 3000) { ok++; process.stdout.write('.'); }
      else { fail++; console.log('SMALL', slug, size); }
    } catch(e) {
      fail++;
      console.log('FAIL', slug, e.message);
    }
  }
  console.log('\nDone:', ok, 'OK,', fail, 'fail');
}
run();
