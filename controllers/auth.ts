export const authController = {
    async login(req, res) {
        req.login(req.user, (err) => {
            if (err) {
                console.log(err)
                return res.status(500).send({ message: err })
            }
            console.log("Authenticated user:", req.user.username)
            console.log("--------------------")
            console.log(req.session)
            console.log("--------------------")
            return res.status(200).send({ message: "Logged in." })
        })
    },

    async logout(req, res) {
        if (req.isAuthenticated()) {
            req.logout((err) => {
                if (err) {
                    console.log(err)
                    return res.status(500).send({ message: err })
                }
                console.log("Logging out user:", req.user)
                req.session.destroy((err) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).send({ message: err })
                    }
                    return res.status(200).send({ message: "Logged out." })
                })
            })
        }
        else {
            return res.status(401).send({ message: "You're not logged in" })
        }
    }
}

