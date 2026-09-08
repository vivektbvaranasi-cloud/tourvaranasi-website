import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const images = [
  {
    path: 'assets/images/pmj-hero-boat-guide.webp',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/6864d30d-c451-4c58-b1ce-e43e920f90e5.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjA3NzlhMTM1M2ZjNzU3YiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4OTAwNjg2N30.UaHX0uugUiDdNcFOk8q9D1FjI4K-td_4pzjWLbYsb8M',
      'https://www.tourvaranasi.com/assets/images/pmj-hero-boat-guide.webp'
    ]
  },
  {
    path: 'assets/images/pmj-temple-blessing.webp',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/b9eb6bd2-c13d-4c4d-896a-9e2d4a390e59.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZGM1NTljNzAwYTgzMWE1YyIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4ODk3MjUyOH0.v4SkCNrHtfHoCtWn4wCDm8NISTeN2aZBZ-lgDv1N8mU',
      'https://www.tourvaranasi.com/assets/images/pmj-temple-blessing.webp'
    ]
  },
  {
    path: 'assets/images/pmj-street-food-guide.webp',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/dffa375d-fbf2-4030-828f-41ba8880eae1.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYWYyYTYyM2M4MzUzYmFiMyIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4ODk3OTI2MH0.9HfvxKajS4iOMyjmB_Cb-X3x02Is7tGwdWrXtBKxLL0',
      'https://www.tourvaranasi.com/assets/images/pmj-street-food-guide.webp'
    ]
  },
  {
    path: 'assets/images/pmj-banarasi-weaving.webp',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/3023d49d-8ca0-4e03-92e0-96260fd91291.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTI3YzBhMDlhYTE4YWZkNCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4ODk1Mjk2OX0.VkyGNNyL9D0OI-B1xsrB2pebh2EvcdEi3_bL3X7Y0qA',
      'https://www.tourvaranasi.com/assets/images/pmj-banarasi-weaving.webp'
    ]
  },
  {
    path: 'assets/images/pmj-chai-lanes.webp',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/8d467864-11ed-4881-a512-56f9270f878c.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzBlZjZiNGMxYTQyNmIzMSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4OTAyNDg0NH0.Cm1CPIJw4s9-Kl3Ca8WBiqUDAvdqItBO0sVPlMufQno',
      'https://www.tourvaranasi.com/assets/images/pmj-chai-lanes.webp'
    ]
  }
];

function isPng(buffer) {
  return buffer.length > 500000 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
}

async function fetchValidImage(sources) {
  let lastError;
  for (const url of sources) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!isPng(buffer)) throw new Error(`unexpected image payload (${buffer.length} bytes)`);
      return buffer;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('No usable image source');
}

for (const image of images) {
  const buffer = await fetchValidImage(image.sources);
  await mkdir(dirname(image.path), { recursive: true });
  await writeFile(image.path, buffer);
  console.log(`Prepared ${image.path}: ${buffer.length} bytes`);
}
