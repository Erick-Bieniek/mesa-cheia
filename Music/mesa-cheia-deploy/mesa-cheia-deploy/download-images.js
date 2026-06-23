/**
 * download-images.js
 * Roda UMA VEZ na sua maquina para baixar as capas reais dos jogos.
 *
 * Como usar:
 *   cd mesa-cheia-zip       (pasta raiz do projeto)
 *   node download-images.js
 *
 * O script baixa as imagens do BoardGameGeek CDN e salva em frontend/img/
 * substituindo os placeholders SVG pelos JPGs reais.
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const OUT_DIR = path.join(__dirname, 'frontend', 'img');

// Capas oficiais via BoardGameGeek CDN (pic IDs das versoes canonicas)
const IMAGES = [
  { file: 'catan.jpg',        url: 'https://cf.geekdo-images.com/images/pic2419375_md.jpg' },
  { file: 'wingspan.jpg',     url: 'https://cf.geekdo-images.com/images/pic4458123_md.jpg' },
  { file: 'ticket.jpg',       url: 'https://cf.geekdo-images.com/images/pic38668_md.jpg'   },
  { file: 'pandemic.jpg',     url: 'https://cf.geekdo-images.com/images/pic1534148_md.jpg' },
  { file: 'azul.jpg',         url: 'https://cf.geekdo-images.com/images/pic3718275_md.jpg' },
  { file: 'carcassonne.jpg',  url: 'https://cf.geekdo-images.com/images/pic2337577_md.jpg' },
  { file: 'codenames.jpg',    url: 'https://cf.geekdo-images.com/images/pic2582929_md.jpg' },
  { file: 'dixit.jpg',        url: 'https://cf.geekdo-images.com/images/pic3483355_md.jpg' },
  { file: '7wonders.jpg',     url: 'https://cf.geekdo-images.com/images/pic860217_md.jpg'  },
  { file: 'spiritisland.jpg', url: 'https://cf.geekdo-images.com/images/pic3615739_md.jpg' },
  { file: 'splendor.jpg',     url: 'https://cf.geekdo-images.com/images/pic1904079_md.jpg' },
  { file: 'thecrew.jpg',      url: 'https://cf.geekdo-images.com/images/pic5765899_md.jpg' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
        'Referer':    'https://boardgamegeek.com/',
        'Accept':     'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    };

    const req = client.get(url, options, (res) => {
      // Segue redirect (302/301)
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} para ${url}`));
      }

      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });

    req.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  console.log('Mesa Cheia — Download de capas dos jogos');
  console.log(`Destino: ${OUT_DIR}\n`);

  let ok = 0, erros = 0;

  for (const { file, url } of IMAGES) {
    const dest = path.join(OUT_DIR, file);
    process.stdout.write(`Baixando ${file.padEnd(20)} ... `);
    try {
      await download(url, dest);
      console.log('OK');
      ok++;
    } catch (err) {
      console.log(`ERRO: ${err.message}`);
      erros++;
    }
  }

  console.log(`\nPronto: ${ok} baixadas, ${erros} com erro.`);

  if (erros === 0) {
    console.log('\nAgora reinicie o servidor (npm start) para ver as imagens reais.');
  } else {
    console.log('\nAlgumas imagens falharam. O site ainda funciona com os SVGs de placeholder.');
    console.log('Tente rodar o script novamente ou verifique sua conexao com a internet.');
  }
})();
