/**
 * Utility function to automatically find YouTube links in rich-text content
 * and replace them with responsive, beautiful iframe video embeds.
 * Supports standard watch links, shortened youtu.be links, embeds, and YouTube Shorts.
 */
export function embedVideos(content: string): string {
  if (!content) return "";

  // 1. First, replace any <a> tags wrapping a YouTube URL
  // Matches <a href="YOUTUBE_URL">...</a>
  const youtubeLinkRegex = /<a\s+[^>]*href=["'](https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s"']*)?)["'][^>]*>([\s\S]*?)<\/a>/gi;
  
  let temp = content.replace(youtubeLinkRegex, (match, url, videoId) => {
    return `
      <div class="relative w-full aspect-video rounded-xl overflow-hidden border border-border/40 shadow-sm my-6 bg-black">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          class="absolute inset-0 w-full h-full" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      </div>
    `;
  });

  // 2. Second, replace standalone YouTube URLs that might be wrapped in formatting tags like <font>, <u>, <i>, <span>, <strong>, <em>, <a>, <b>
  // Strips the wrapping formatting tags around the URL so that the block-level iframe isn't brokenly wrapped inside inline styling tags.
  // Adding negative lookbehind guard (?<!src=\s*["']?) to prevent double-replacement of already generated iframe src attributes.
  const standaloneRegex = /(?<!src=\s*["']?)(?:<(?:font|u|i|span|strong|em|a|b|ins|del|mark)[^>]*>)*\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s<"']*)?)\s*(?:<\/(?:font|u|i|span|strong|em|a|b|ins|del|mark)>)*/gi;

  return temp.replace(standaloneRegex, (match, url, videoId) => {
    return `
      <div class="relative w-full aspect-video rounded-xl overflow-hidden border border-border/40 shadow-sm my-6 bg-black">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          class="absolute inset-0 w-full h-full" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      </div>
    `;
  });
}
