import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from '../models/model.js'
import { JWT_SECRET } from "../middleware/auth.js";
import { sendProjectEmail, sendBulkProjectEmails } from "../utils/emailService.js";

export const userRegister = async (req, res) => {
    try {
        const { type, name, email, password } = req.body;
        const isExist = await userModel.findOne({ email });
        if (isExist) {
            return res.json({
                code: 400,
                success: false,
                message: "User already exists",
                result: "",
                error: true
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // new developers get a free starter token balance, clients/admin don't need tokens
        const startingCredit = type === "user" ? 50 : 0;
        const data = new userModel({ type, name, email, password: hashedPassword, credit: startingCredit })
        const result = await data.save()
        sendProjectEmail({
            to: result.email,
            subject: "Welcome to Zentora",
            text: `Hi ${result.name || ""}, your ${result.type === "client" ? "client" : "talent"} account has been created successfully. Welcome to Zentora!`
        }).catch(() => {});
        userModel.find({ type: "admin", isDeleted: { $ne: true } }).select("email").then((admins) => {
            sendBulkProjectEmails(admins.map((admin) => admin.email), {
                subject: `New ${result.type === "client" ? "client" : "user"} registered: ${result.name || result.email}`,
                text: `${result.name || "A new user"} registered on Zentora with email ${result.email}.`
            });
        }).catch(() => {});
        const safeResult = result.toObject();
        delete safeResult.password;
        res.json({
            code: 200,
            success: true,
            message: "User register successfully.",
            result: safeResult,
            error: false
        })
    } catch (err) {
        res.json({
            code: 500,
            success: false,
            message: "Internal Server Error",
            result: "",
            error: true
        })
    }
}

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({
                code: 404,
                success: false,
                message: "Invalid email or password.",
                result: '',
                error: true
            })
        }
        if (user.isDeleted) {
            return res.json({ code: 403, success: false, message: "This account has been deleted", result: "", error: true })
        }
        if (user.isBlocked) {
            return res.json({
                code: 403,
                success: false,
                message: "Your account has been blocked. Contact support.",
                result: '',
                error: true
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({
                code: 404,
                success: false,
                message: "Invalid email or password.",
                result: '',
                error: true
            })
        }
        const token = jwt.sign({ id: user._id, type: user.type }, JWT_SECRET, { expiresIn: "7d" });
        sendProjectEmail({
            to: user.email,
            subject: "New login to your Zentora account",
            text: `Hi ${user.name || ""}, you signed in to Zentora successfully at ${new Date().toLocaleString()}.`
        }).catch(() => {});
        const safeUser = user.toObject();
        delete safeUser.password;
        res.json({
            code: 200,
            success: true,
            message: "Login successful",
            result: { user: safeUser, token },
            error: false
        })
    } catch (err) {
        res.json({
            code: 500,
            success: false,
            message: "Internal Server Error",
            result: "",
            error: true
        })
    }
}
