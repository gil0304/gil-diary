import fs from "fs";
import path from "path";
import { GetStaticPaths, GetStaticProps } from "next";
import { remark } from "remark";
import html from "remark-html";
import matter from "gray-matter";
import Navigation from "@/pages/article/navigation";

const ArticlePage = ({
  content,
  articles,
}: {
  content: string;
  articles: { title: string; slug: string; genre: string }[];
}) => (
  <div>
    <Navigation articles={articles} />
    <div dangerouslySetInnerHTML={{ __html: content }} />
  </div>
);

const markdownDir = path.join(process.cwd(), "markdown");

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: fs.readdirSync(markdownDir).map((name) => ({
    params: { slug: name.replace(/\.md$/, "") },
  })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const filePath = path.join(markdownDir, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const articles = fs.readdirSync(markdownDir).map((name) => {
    const { data } = matter(
      fs.readFileSync(path.join(markdownDir, name), "utf8")
    );
    return {
      slug: name.replace(/\.md$/, ""),
      title: data.title,
      genre: data.genre,
    };
  });

  const processedContent = await remark().use(html).process(content);

  return { props: { content: processedContent.toString(), articles } };
};

export default ArticlePage;
