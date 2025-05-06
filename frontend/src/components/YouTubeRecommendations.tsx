type Video = {
  url: string;
  title: string;
};

type Props = {
  videos: Video[];
};

export default function YouTubeRecommendations({ videos }: Props) {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="mt-6 px-4">
      <h3 className="text-lg font-semibold mb-3">Related Videos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, idx) => {
          const [baseUrl, queryString] = video.url.split("?");
          const startMatch = queryString?.match(/t=(\d+)/);
          const startTime = startMatch ? `?start=${startMatch[1]}` : "";
          const embedUrl = baseUrl
            .replace("watch?v=", "embed/")
            .replace("youtu.be/", "www.youtube.com/embed/") + startTime;

          return (
            <div key={idx} className="rounded-lg overflow-hidden shadow bg-white">
              <iframe
                className="w-full h-48"
                src={embedUrl}
                title={`YouTube video ${idx + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="p-2 text-sm text-gray-700 font-medium">{video.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}