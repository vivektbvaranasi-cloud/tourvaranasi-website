import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const images = [
  {
    path: 'assets/images/destinations/mathura-janmabhoomi.jpg',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/cfc62ebc-87f9-4234-9618-71de35779883.jpg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNGJlZjgzYTkwOTI3M2NmNCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4OTAxODQwOX0._y9wMqJd5z711IGG20LXRmU3m6NExtKUWHWDOkYuyEM',
      'https://www.tourvaranasi.com/assets/images/destinations/mathura-janmabhoomi.jpg'
    ]
  },
  {
    path: 'assets/images/destinations/mathura-dwarkadhish.jpg',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/93cd4af0-1e60-4e23-91bc-fa5d0db6953f.jpg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzkzN2E5ZjFkYzZhODY5NCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4ODk1OTYwMX0._iczzDcLl0lrM9BMF1R2mnKxG1i4eKRT6rNlUjr-BXs',
      'https://www.tourvaranasi.com/assets/images/destinations/mathura-dwarkadhish.jpg'
    ]
  },
  {
    path: 'assets/images/destinations/mathura-vishram-ghat.jpg',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/60e10318-13e7-4ce6-ac6f-faaee247c1cb.jpg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiM2QxZjU0MDM1OGUwYTJjZiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4ODk4MDA5OX0.gdJmQMv4Kc3-bcePb7dFzAge9cdnCvsk3lVg0WMNBr0',
      'https://www.tourvaranasi.com/assets/images/destinations/mathura-vishram-ghat.jpg'
    ]
  },
  {
    path: 'assets/images/destinations/vrindavan-iskcon.jpg',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/574d6d22-6e31-45fa-98bc-ec49390ebddb.jpg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzBkOGUxNWFhMmZiNjM5MSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4OTAxNDIzNH0.tfrOxoxDxFPss28sJgi7GrKmtfYS6tj-PsO2wSAcGGw',
      'https://www.tourvaranasi.com/assets/images/destinations/vrindavan-iskcon.jpg'
    ]
  },
  {
    path: 'assets/images/destinations/vrindavan-prem-mandir.jpg',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/195fc37e-6efe-455d-8840-a3e011f33f73.jpg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNjBlMjliZGJlNDM3YWM2ZSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4OTAxODk3MX0.geHP1OGMd0-trLdQuGPlorcK-rost830h12tgabNtcw',
      'https://www.tourvaranasi.com/assets/images/destinations/vrindavan-prem-mandir.jpg'
    ]
  },
  {
    path: 'assets/images/destinations/vrindavan-radhavallabh.jpg',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/e58ed019-079a-45bc-b044-58c1399f4916.jpg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTQ1ZDE4YjQ0MDIxZjlhMCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4OTAxODI5Mn0.QpxX2U2BZXtUYjojSffxHr1f9uLBHIG5bsf7zbqPAlY',
      'https://www.tourvaranasi.com/assets/images/destinations/vrindavan-radhavallabh.jpg'
    ]
  },
  {
    path: 'assets/images/destinations/agra-taj-mahal.jpg',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/167b8cda-ae5f-44fa-b293-93f66c6f693f.jpg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMjY4MDYzZTI0YTEwMjE5MCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4OTAyMDM4Nn0.hN7usjbpOYbHC_DEoJSVsAmMG3omdv-dLpQo3Y-rOdQ',
      'https://www.tourvaranasi.com/assets/images/destinations/agra-taj-mahal.jpg'
    ]
  },
  {
    path: 'assets/images/destinations/agra-fort.jpg',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/1846c49f-6302-4eca-bfd3-fd6fea2eded8.jpg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMWY2NTQ3ZDRjNjRlZGNlNyIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4OTAzNTIyMH0.m2jjGIYjCEygXed4Y2PiJn0OOV9Tev8A2fVyBFEf70w',
      'https://www.tourvaranasi.com/assets/images/destinations/agra-fort.jpg'
    ]
  },
  {
    path: 'assets/images/destinations/delhi-red-fort.jpg',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/c21a333a-5308-4bab-ba27-0952807e0b74.jpg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzYzOTQ3NGUxYmRjYmEzNyIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4OTAxODU3NH0.V6QnpCK_UmzbeaOVZPYwlS-UZN06VePUxPaY-nlJ9xM',
      'https://www.tourvaranasi.com/assets/images/destinations/delhi-red-fort.jpg'
    ]
  },
  {
    path: 'assets/images/destinations/delhi-india-gate.jpg',
    sources: [
      'https://d2jqrm6oza8nb6.cloudfront.net/datasets/ead7b8a0-448c-4ad1-bf4b-2cbd1f6d7e9e.jpg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNTExYjQxOWVlNWY2ZTc2OCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4OTAyNTU2Nn0.lY6hR_SuAuUj6f0s1FjA1LuHRZAJQBndU5P8yb7sFLs',
      'https://www.tourvaranasi.com/assets/images/destinations/delhi-india-gate.jpg'
    ]
  }
];

function isJpeg(buffer) {
  return buffer.length > 10000 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;
}

async function fetchValidImage(sources) {
  let lastError;
  for (const url of sources) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!isJpeg(buffer)) throw new Error(`unexpected image payload (${buffer.length} bytes)`);
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
