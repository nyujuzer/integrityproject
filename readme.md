
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
- /create-articles?api_key=YOUR_API_KEY - runs the article creation process. Right now, there is only one API key available, as the project is still in development. I chose set this system up, to make sure only us can access the model. i wouldn't want a $3000 invoice from google. 
This will not be needed on the front-end

- /filter-articles?tags=tag1+tag2 - This will return the articles on which the specified tags are present.This way the user's can select if they wanna read news that are about both economy, and the state of yu-gi-oh for example

- /register - This is a POST request, in which you pass in name, email, and password into the body.
- /login - This endpoint is a POST request, however it's unavailable until further notice
- /recommended - This GET request will return a list of articles, weighed by the tags the user has deliberately clicked on  
This endpoint will return in the same format as /articles

## roadmap

I plan to add ways to make news with a specific tag.