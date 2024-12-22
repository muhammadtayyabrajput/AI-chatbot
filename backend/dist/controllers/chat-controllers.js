import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import { OpenAIApi } from "openai";
export const generateChatCompletion = async (req, res, next) => {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Invalid or missing message" });
    }
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res
                .status(401)
                .json({ message: "User not registered or token malfunctioned" });
        }
        const chats = user.chat.map(({ role, content }) => ({
            role,
            content,
        }));
        chats.push({ content: message, role: "user" });
        const config = configureOpenAI();
        const openai = new OpenAIApi(config);
        let chatResponse;
        try {
            chatResponse = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: chats,
            });
        }
        catch (apiError) {
            if (apiError.response?.data?.error?.code === "insufficient_quota") {
                console.error("Quota Exceeded:", apiError.response.data.error.message);
                return res.status(403).json({
                    message: "OpenAI API quota exceeded. Please try again later or contact support.",
                });
            }
            console.error("OpenAI API Error:", apiError.response?.data || apiError);
            return res.status(500).json({
                message: "Failed to process chat completion",
                error: apiError.response?.data || "Unknown API Error",
            });
        }
        if (!chatResponse?.data?.choices?.[0]?.message) {
            return res
                .status(500)
                .json({ message: "Unexpected response from OpenAI API" });
        }
        user.chat.push(chatResponse.data.choices[0].message);
        await user.save();
        return res.status(200).json({ chats: user.chat });
    }
    catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
export const sendChatsToUser = async (req, res, next) => {
    try {
        //user token check
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send("User not registered OR Token malfunctioned");
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        return res.status(200).json({ message: "OK", chats: user.chat });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause: error.message });
    }
};
export const deleteChats = async (req, res, next) => {
    try {
        //user token check
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send("User not registered OR Token malfunctioned");
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        //@ts-ignore
        user.chats = [];
        await user.save();
        return res.status(200).json({ message: "OK" });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause: error.message });
    }
};
//# sourceMappingURL=chat-controllers.js.map