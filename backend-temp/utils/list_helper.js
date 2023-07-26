const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const result = blogs.reduce((like_sum,blogi) => like_sum + blogi.likes,0)
    return result
}

const deconstructBlog = (blog) => {
    // https://stackoverflow.com/questions/17781472/how-to-get-a-subset-of-a-javascript-objects-properties
    return (({ title, author, likes }) => ({ title, author, likes }))(blog)
}

const favoriteBlog = (blogs) => {
    // palauttaa listan eniten tykkäyksiä saaneen blogin tiedot
    // tehtävänannossa palautetaan
    // title
    // author
    // likes
    // jos monella blogilla eniten tykkäyksiä, niin palautetaan yksi

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
    // "Getting the maximum element of an array"
    //const bloglist = blogs.map(b => deconstructBlog(b))
    if (blogs.length === 0) {
        return null
    } else if (blogs.length === 1) {
        return deconstructBlog(blogs[0])
    } else {
        const mostLikedBlog = blogs.reduce(
            (tykatyin,blogi) => {
                return tykatyin.likes <= blogi.likes
                    ? blogi
                    : tykatyin
            },blogs[0])
        return deconstructBlog(mostLikedBlog)
    }
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return null
    } else {
    const authors = blogs.reduce(
        (authors,blog) => authors.concat(blog.author),[])
    const result = authors.reduce((authorObj,x,_,a) => {
        const count = a.filter(ai => ai === x).length
        return authorObj.blogs < count
            ? authorObj = { author: x, blogs : count }
            : authorObj
    },
    { 
        author : authors[0],
        blogs : authors.filter(ai => ai === authors[0]).length
    })
    return result
    }
}

const mostLikes = (blogs) => {
    // sama idea kuin mostBlogs
    // mapataan reducella blogilista, mutta nyt objekteiksi
    // sitten objektilistaan reduce, jolla lasketaan tykkäykset
    if (blogs.length === 0) {
        return {}
    } else {
        const authorLikes = blogs.reduce((rarr,item) => {
            //console.log(rarr,item)
            return rarr.concat({
                author: item.author,
                likes: item.likes
            })
        },[])
        const result = authorLikes.reduce(
            (rObj,item,_,arr) => {
                const likeCount = 
                    arr.filter(x => x.author === item.author)
                    .map(x => x.likes)
                    .reduce((sum,x) => sum += x,0)
                
                return rObj.likes < likeCount
                    ? rObj = { author: item.author, likes: likeCount }
                    : rObj
            },
            {
                author: authorLikes[0].author,
                likes: authorLikes.filter(x => x.author === authorLikes[0].author)
                .map(x => x.likes)
                .reduce((sum,x) => sum += x,0)
            })
        return result
    }
}

module.exports = {
    dummy,
    deconstructBlog,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}