import fs from "fs";
import path from "path";
import matter from "gray-matter";

type Article = { title: string; slug: string; genre: string };

const Home = ({
  groupedArticles,
}: {
  groupedArticles: { [genre: string]: Article[] };
}) => (
  <div
    style={{ display: "flex", justifyContent: "space-between", gap: "2rem" }}
  >
    {Object.entries(groupedArticles).map(([genre, articles]) => (
      <div key={genre} style={{ flex: 1 }}>
        <h2>{genre}</h2>
        <ul>
          {articles.map(({ title, slug }) => (
            <li key={slug}>
              <a href={`/article/${slug}`}>{title}</a>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

export const getStaticProps = async () => {
  const markdownDir = path.join(process.cwd(), "markdown");

  // 再帰的にMarkdownファイルを読み込む関数
  const readArticlesRecursively = (dir: string, genre: string): Article[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return readArticlesRecursively(fullPath, entry.name); // フォルダ名をジャンルとして渡す
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data } = matter(fileContents);
        return {
          slug: `${entry.name.replace(/\.md$/, "")}`, // フォルダ名を含めたスラッグ
          title: data.title || "Untitled",
          genre,
        };
      }
      return [];
    });
  };

  // Markdownフォルダを再帰的に読み込む
  const articles = readArticlesRecursively(markdownDir, "");

  // ジャンルごとにグループ化
  const groupedArticles = articles.reduce<{ [key: string]: Article[] }>(
    (acc, article) => {
      const { genre, title, slug } = article;
      if (!acc[genre]) acc[genre] = [];
      acc[genre].push({ title, slug, genre });
      return acc;
    },
    {}
  );

  return { props: { groupedArticles } };
};

export default Home;
