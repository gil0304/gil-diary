import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

const Home = ({
  articles,
}: {
  articles: { title: string; slug: string; genre: string }[];
}) => (
  <div>
    <h1>記事一覧</h1>
    <ul>
      {articles.map(({ title, slug, genre }) => (
        <li key={slug}>
          <Link href={`/article/${slug}`}>{title}</Link> - <span>{genre}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const getStaticProps = async () => {
  const markdownDir = path.join(process.cwd(), "markdown");
  const articles = fs.readdirSync(markdownDir).map((name) => {
    const filePath = path.join(markdownDir, name);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);

    return {
      slug: name.replace(/\.md$/, ""),
      title: data.title,
      genre: data.genre,
    };
  });

  return { props: { articles } };
};

export default Home;
