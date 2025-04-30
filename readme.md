
# Integrity Project

This is the backend for the AI run satirical news site with [Falkon](https://github.com/falkon2)
## Documentation
This API will fetch 10 news stories, and create satirical stories based off it.

The Data structures look as follows:
```
interface satirical_article{
    title:string
    content:string
    tags:string[]
}
```
The application's data will always be returned as such, either as an array, or similar collections.
## Features

- /articles - returns all available articles
### usage:
```
const get_all_articles = async ()=>{
    const response = fetch(`${baseURL}/articles)
    //this will return an array of all articles
    return response.json()
}
```
- /article/{id} - returns a specific record
### usage:
```
const get_specific_article = async (article_id)=>{
    const response = fetch(`${baseURL}/article/${article_id})
    //this will return an array of all articles
    return response.json()
}
```
- /create-articles?api_key=YOUR_API_KEY - runs the article creation process. Right now, there is only one API key available, as the project is still in development. I chose set this system up, to make sure only us can access the model. i wouldn't want a $3000 invoice from google,

This will not be needed on the front-end

## roadmap

I wanna add a filtering option based on the tags.
I will specify the tags, right now the AI makes the tags up on it's own, due to the google genai package's typing limitations.
I plan to add ways to make news with a specific tag.