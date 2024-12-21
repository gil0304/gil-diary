import Link from "next/link";
import { useRouter } from "next/router";

type Article = { title: string; slug: string; genre: string };
type NavigationProps = {
  articles: Article[];
};

const Navigation = ({ articles }: NavigationProps) => {
  const { query } = useRouter();
  const currentSlug = query.slug || "";

  // ジャンルごとにグループ化
  const groupedArticles = articles.reduce<{ [key: string]: Article[] }>(
    (acc, article) => {
      const { genre } = article;
      if (!acc[genre]) acc[genre] = [];
      acc[genre].push(article);
      return acc;
    },
    {}
  );

  return (
    <nav>
      <ul>
        {Object.entries(groupedArticles).map(([genre, articles]) => (
          <li key={genre}>
            <h3>{genre}</h3>
            <ul>
              {articles.map(({ title, slug }) => (
                <li key={slug}>
                  <Link href={`/article/${slug}`}>
                    <span
                      style={{ color: currentSlug === slug ? "red" : "blue" }}
                    >
                      {title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
