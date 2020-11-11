const jwt = require('json-web-token');

let users = {
    tabish:{password:"passwordtabish"},
    ali:{password:"passwordali"}
}

exports.login =function(req,res){
    
    let username = req.body.username
    let password = req.body.password

    if(!username || !password || users[username].password !== password){
        return res.status(401).send();
    }

    let payload = {username:username}

    let accessToken = jwt.sign(payload,
        process.env.ACCESS_TOKEN_SECRET,{
            algorithm:"HS256",
            expiresIn:process.env.ACCESS_TOKEN_LIFE    
        })

    let refreshToken = jwt.sign(payload,
        process.env.REFRESH_TOKEN_SECRET,{
            algorithm:"HS256",
            expiresIn:process.env.REFRESH_TOKEN_LIFE
        })    

    users[username].refreshToken = refreshToken
    
    res.cookie("jwt",accessToken,{secure:true,httpOnly:true})

    res.send();
}


exports.refresh = function(req,res){
    let accessToken = req.cookie.jwt

    if(!accessToken)
    {
        return res.status(401).send();
    }

    let payload;
    try{
        payload = jwt.verify(accessToken,
            process.env.ACCESS_TOKEN_SECRET
        )
        next()
    }
    catch(err){
        return res.status(401).send();
    }


    let refreshToken = users[payload.username].refreshToken

    try{
        jwt.verify(refreshToken,
            process.env.REFRESH_TOKEN_SECRET)
    }
    catch(e){
        return res.status(401).send()
    }

    let newToken = jwt.sign(payload,
        process.env.ACCESS_TOKEN_SECRET,
        {
            algorithm:'HS256',
            expiresIn:process.env.ACCESS_TOKEN_LIFE
        })
    res.cookie("jwt",newToken,{secure:true,httpOnly})
    res.send()    
}
