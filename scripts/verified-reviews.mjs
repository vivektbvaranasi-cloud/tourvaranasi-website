// Screened Tripadvisor listing positions 1–102 on 2026-10-05.
// Short verbatim excerpts; reviewer names and individual review links verified.
const reviews = [
 ['Archana S','981000693','November 2024','Bharat was very accommodating and took us to all the places we wanted to go. Communication was excellent.'],
 ['frankief922','945709706','April 2024','We started with a sunrise boat ride which was extremely moving and peaceful.'],
 ['rajagopal b','956942526','June 2024','We had 5 day four nights tour of Ayodhya and Varanasi. The tour was very well organised.'],
 ['kechjo','945966458','April 2024','The sunrise boat tour was great and our guide provided a lot of interesting information and insight.'],
 ['Vago1994','969806583','September 2024','He was able to adapt our itinerary to my needs, weather and crowd.'],
 ['ajnath2021','891631782','May 2023','I had the same guide and driver for the entire trip which gave me much comfort.']
];
function quote(i, tag='cite', cls='') {
 const [name,id,date,text]=reviews[i];
 const url=`https://www.tripadvisor.in/ShowUserReviews-g297685-d10366118-r${id}-Tour_Varanasi-Varanasi_Varanasi_District_Uttar_Pradesh.html`;
 return `<blockquote>“${text}”</blockquote><${tag}${cls?` class="${cls}"`:''}>${name} · ${date} · Tripadvisor</${tag}><a class="verified-review-link" href="${url}" target="_blank" rel="noopener noreferrer">Read the original review on Tripadvisor ↗</a>`;
}
export function refreshVerifiedReviews(html,file) {
 if(file==='index.html') return html.replace(/<blockquote>[\s\S]*?<\/blockquote>\s*<p class="review-name">[\s\S]*?<\/p>(?:<a class="verified-review-link"[\s\S]*?<\/a>)?/,quote(0,'p','review-name'));
 if(file==='plan-my-journey/index.html') return html.replace(/<blockquote>[\s\S]*?<\/blockquote>\s*<p>[\s\S]*?<\/p>(?:<a class="verified-review-link"[\s\S]*?<\/a>)?/,quote(5,'p'));
 if(['reviews/index.html','about-us/index.html','about-tour-varanasi/index.html'].includes(file)) {
  let i=0; return html.replace(/<blockquote>[\s\S]*?<\/blockquote>\s*<cite>[\s\S]*?<\/cite>(?:<a class="verified-review-link"[\s\S]*?<\/a>)?/g,()=>quote((i++)%reviews.length));
 }
 return html;
}
