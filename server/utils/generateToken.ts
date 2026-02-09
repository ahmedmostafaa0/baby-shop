import jwt from 'jsonwebtoken'

const generateTokens = (id: string) => {
    const accessToken = jwt.sign({id}, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: '30s'
    })
    const refreshToken = jwt.sign({id}, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '30d'
    })
    return {accessToken, refreshToken}
}

export default generateTokens;
