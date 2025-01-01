import fs from "fs";
import path from "path";
import { GetStaticPaths, GetStaticProps } from "next";
import { remark } from "remark";
import html from "remark-html";
import matter from "gray-matter";
import Navigation from "@/pages/article/navigation";
import MarkdownStyles from "@/styles/Markdown/Markdown.module.css";

const ArticlePage = ({
  content,
  articles,
}: {
  content: string;
  articles: { title: string; slug: string; genre: string }[];
}) => (
  <div>
    <div>
      <Navigation articles={articles} />
    </div>
    <div
      className={MarkdownStyles.content}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  </div>
);

const markdownDir = path.join(process.cwd(), "markdown");

export const getStaticPaths: GetStaticPaths = async () => {
  const getPathsRecursively = (dir: string): { params: { slug: string } }[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return getPathsRecursively(fullPath); // 再帰呼び出し
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const slug = entry.name.replace(/\.md$/, ""); // ファイル名をスラッグに
        return [{ params: { slug } }];
      }
      return [];
    });
  };

  const paths = getPathsRecursively(markdownDir);

  console.log("Generated paths:", paths); // デバッグ: 生成されたパスを確認

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  if (!slug) {
    throw new Error("Invalid slug");
  }

  // 再帰的にファイルを検索して対応するファイルパスを取得
  const findFileRecursively = (dir: string): string | null => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const result = findFileRecursively(fullPath);
        if (result) return result;
      } else if (entry.isFile() && entry.name.replace(/\.md$/, "") === slug) {
        return fullPath;
      }
    }
    return null;
  };

  const filePath = findFileRecursively(markdownDir);

  if (!filePath) {
    console.error(`File not found for slug: ${slug}`);
    throw new Error(`File not found: ${filePath}`);
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  // ナビゲーション用の記事リストを作成
  const articles = fs
    .readdirSync(markdownDir, { withFileTypes: true })
    .flatMap((entry) => {
      if (entry.isDirectory()) {
        const subDir = path.join(markdownDir, entry.name);
        return fs.readdirSync(subDir).map((file) => {
          const subFileContents = fs.readFileSync(
            path.join(subDir, file),
            "utf8"
          );
          const { data } = matter(subFileContents);
          return {
            slug: file.replace(/\.md$/, ""), // ファイル名のみをスラッグに
            title: data.title || "Untitled",
            genre: entry.name,
          };
        });
      }
      return [];
    });

  const processedContent = await remark().use(html).process(content);

  return { props: { content: processedContent.toString(), articles } };
};

export default ArticlePage;
