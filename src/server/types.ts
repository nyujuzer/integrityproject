const tags = [
  "POLITICS",
  "ECONOMY",
  "TECHNOLOGY",
  "HEALTH",
  "ENTERTAINMENT",
  "SPORTS",
  "ENVIRONMENT",
  "INTERNATIONAL",
  "CULTURE",
  "OPINION",
  "INVESTIGATIONS",
  "BREAKING_NEWS",
  "CONSPIRACIES",
  "HUMAN_INTEREST",
  "CELEBRITIES",
  "SCIENCE",
  "CRIME",
  "MILITARY",
  "FAITH",
  "WEIRD_NEWS",
  "UFO_SIGHTINGS",
  "CORPORATE_SCANDALS",
  "ARTIFICIAL_INTELLIGENCE",
  "HISTORICAL_REVISIONISM",
  "AGRICULTURE",
  "EDUCATION",
  "SOCIAL_MEDIA",
  "SECRET_SOCIETIES",
  "REAL_ESTATE",
];

interface VerboseResult {
  success: boolean;
  message: string;
  error?: any;
};

interface NewsArticle {
  title: string;
  content: string;
  tags: string[];
};
interface transitionaryArticle {
  title: string;
  description: string;
}

interface ranked_article extends NewsArticle{
  rank:number
}
interface user_tag {
    tag:string,
    value: number
}
export type {NewsArticle, ranked_article, user_tag, transitionaryArticle, VerboseResult}
export {tags}