type TagListProps = {
    tags: string;
  };
  
  export default function TagList({ tags }: TagListProps) {
    const tagList = tags ? tags.split(", ") : [];
  
    return (
      <div className="video_tags">
        {tagList.map((tag, index) => (
          <span key={index} className="video_tag">
            {tag}
          </span>
        ))}
      </div>
    );
  }