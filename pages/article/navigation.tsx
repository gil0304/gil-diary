import Link from "next/link";
import { useRouter } from "next/router";
import Styles from "@/styles/Navigation/Navigation.module.css";

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
    <nav className={Styles.nav}>
      <ul className={Styles["nav-list"]}>
        <h2>
          <Link href="/">ぎる日記</Link>
        </h2>
        {Object.entries(groupedArticles).map(([genre, articles]) => (
          <li key={genre} className={Styles["nav-genre"]}>
            <h3 className={Styles["nav-genre-title"]}>{genre}</h3>
            <ul className={Styles["nav-sublist"]}>
              {articles.map(({ title, slug }) => (
                <li key={slug} className={Styles["nav-sublist-item"]}>
                  <Link
                    href={`/article/${slug}`}
                    className={`${Styles["nav-link"]} ${
                      currentSlug === slug ? Styles.active : ""
                    }`}
                  >
                    {title}
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
