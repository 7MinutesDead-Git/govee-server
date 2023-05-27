export const authController = {
    // Logs in the user, creating a session and sending cookie.
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
    // Destroys the session (logs out the user), invalidating the cookie.
    async logout(req, res) {
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
    },
    // Checks if the user already has a valid session.
    async getSession(req, res) {
        if (req.user) {
            res.send(req.user)
        } else {
            res.status(401).send({ message: 'Not logged in' })
        }
    }
}

