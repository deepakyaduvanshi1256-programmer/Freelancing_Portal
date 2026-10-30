import { ProjectModel, BidModel, userModel, NotificationModel } from "../models/model.js"
import { sendProjectEmail, sendBulkProjectEmails } from "../utils/emailService.js"

export const postProject = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { title, des, budget, duration } = req.body
        const isExist = await ProjectModel.findOne({ clientId, title })
        if (isExist) {
            return res.json({
                code: 400,
                success: false,
                message: "Project allready Exist",
                result: "",
                error: true
            })
        }
        const data = new ProjectModel({ clientId, title, des, budget, duration })
        const result = await data.save()
        res.json({
            code: 200,
            success: true,
            message: "Project Posted Successfully",
            result: result,
            error: false
        })

        setImmediate(async () => {
            try {
                const client = await userModel.findById(clientId);
                sendProjectEmail({ to: client?.email, subject: `Project posted: ${title}`, text: `Your project "${title}" has been posted successfully. Budget: ₹${budget}. Timeline: ${duration}.` }).catch(() => {});

                const registeredUsers = await userModel.find({
                    _id: { $ne: clientId },
                    isDeleted: { $ne: true },
                    email: { $exists: true, $ne: "" }
                }).select("_id name email type");

                const recipientIds = registeredUsers.map((user) => user._id);
                if (recipientIds.length) {
                    await NotificationModel.insertMany(recipientIds.map((userId) => ({
                        userId,
                        senderId: clientId,
                        senderName: client?.name || "Client",
                        message: `${client?.name || "A client"} posted a new project "${title}" with a budget of ₹${budget}.`,
                        type: "general",
                        relatedProjectId: result._id.toString()
                    })));
                }

                sendBulkProjectEmails(registeredUsers.map((user) => user.email), {
                    subject: `New project posted: ${title}`,
                    text: `${client?.name || "A client"} posted a new project "${title}" with a budget of ₹${budget}. Open Zentora to review and place a bid.`
                }).catch(() => {});
            } catch (notificationError) {
                console.error("New project notification failed:", notificationError.message);
            }
        });
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

// Client (owner only) can update the details of an open project
export const updateProject = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, title, des, budget, duration } = req.body;
        if (!projectId || !title?.trim() || !budget?.trim() || !duration?.trim() || !des?.trim()) {
            return res.json({ code: 400, success: false, message: "All project fields are required", result: "", error: true });
        }
        const project = await ProjectModel.findOneAndUpdate(
            { _id: projectId, clientId, status: "open" },
            { title: title.trim(), des: des.trim(), budget: budget.trim(), duration: duration.trim() },
            { new: true, runValidators: true }
        );
        if (!project) {
            return res.json({ code: 400, success: false, message: "Only open projects can be edited", result: "", error: true });
        }
        res.json({ code: 200, success: true, message: "Project updated successfully", result: project, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
}

// Client's own projects (any status)
export const clientProjectList = async (req, res) => {
    try {
        const clientId = req.user.id;
        const projects = await ProjectModel.find({ clientId, isDeleted: { $ne: true } }).sort({ createdAt: -1 })
        const developerIds = projects.map(project => project.assignedTo).filter(Boolean)
        const developers = await userModel.find({ _id: { $in: developerIds } }).select("name email phone headline skill")
        const developerMap = Object.fromEntries(developers.map(developer => [developer._id.toString(), developer.toObject()]))
        const result = projects.map(project => ({
            ...project.toObject(),
            developer: developerMap[project.assignedTo?.toString()] || null
        }))
        res.json({
            code: 200,
            success: true,
            message: "data fetched",
            result: result,
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

// Public feed for developers to browse & bid on
export const listOpenProjects = async (req, res) => {
    try {
        const projects = await ProjectModel.find({ status: "open", isDeleted: { $ne: true } }).sort({ createdAt: -1 })
        const clientIds = projects.map(project => project.clientId).filter(Boolean)
        const clients = await userModel.find({ _id: { $in: clientIds } }).select("name email phone")
        const clientMap = Object.fromEntries(clients.map(client => [client._id.toString(), client.toObject()]))
        const result = projects.map(project => ({ ...project.toObject(), client: clientMap[project.clientId?.toString()] || null }))
        res.json({ code: 200, success: true, message: "Open projects fetched", result, error: false })
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true })
    }
}

// Developer's currently assigned/in-progress work
export const listMyAssignedProjects = async (req, res) => {
    try {
        const developerId = req.user.id;
        const projects = await ProjectModel.find({ assignedTo: developerId, isDeleted: { $ne: true } }).sort({ createdAt: -1 })
        const clientIds = projects.map(project => project.clientId).filter(Boolean)
        const clients = await userModel.find({ _id: { $in: clientIds } }).select("name email phone")
        const clientMap = Object.fromEntries(clients.map(client => [client._id.toString(), client.toObject()]))
        const result = projects.map(project => ({ ...project.toObject(), client: clientMap[project.clientId] || null }))
        res.json({ code: 200, success: true, message: "Assigned projects fetched", result, error: false })
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true })
    }
}

// Client (owner only) can move status forward: in_progress -> completed, or open/assigned -> cancelled
export const requestProjectStart = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, message } = req.body;
        const project = await ProjectModel.findOne({ _id: projectId, clientId, status: "assigned" });
        if (!project) return res.json({ code: 400, success: false, message: "Project has not been assigned yet", result: "", error: true });
        await NotificationModel.create({ userId: project.assignedTo, message: `Client requested to start "${project.title}"${message?.trim() ? `: ${message.trim()}` : ". Please confirm when work begins."}`, type: "project_assigned", relatedProjectId: project._id.toString() });
        const developer = await userModel.findById(project.assignedTo);
        sendProjectEmail({ to: developer?.email, subject: `Project ready to start: ${project.title}`, text: message?.trim() || `Please confirm when you start work on ${project.title}.` }).catch(() => {});
        res.json({ code: 200, success: true, message: "Start request sent to freelancer", result: project, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true }); }
}

export const receiveCompletedProject = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, note } = req.body;
        const project = await ProjectModel.findOneAndUpdate({ _id: projectId, clientId, status: "awaiting_review" }, { status: "completed" }, { new: true });
        if (!project) return res.json({ code: 400, success: false, message: "No delivery is waiting for your confirmation", result: "", error: true });
        await NotificationModel.create({ userId: project.assignedTo, message: note?.trim() ? `Client received and completed "${project.title}": ${note.trim()}` : `Client received and completed "${project.title}".`, type: "project_completed", relatedProjectId: project._id.toString() });
        const developer = await userModel.findById(project.assignedTo);
        sendProjectEmail({ to: developer?.email, subject: `Delivery accepted: ${project.title}`, text: note?.trim() || `The client confirmed receipt and completed ${project.title}.` }).catch(() => {});
        const client = await userModel.findById(clientId);
        userModel.find({ type: "admin", isDeleted: { $ne: true } }).select("email").then((admins) => {
            sendBulkProjectEmails(admins.map((admin) => admin.email), { subject: `Project completed: ${project.title}`, text: `${client?.name || client?.email || "Client"} confirmed delivery and completed "${project.title}".` });
        }).catch(() => {});
        res.json({ code: 200, success: true, message: "Delivery received. Project completed.", result: project, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true }); }
}

export const approveCompletedProject = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, note } = req.body;
        const project = await ProjectModel.findOneAndUpdate({ _id: projectId, clientId, status: "awaiting_review" }, { status: "completed" }, { new: true });
        if (!project) return res.json({ code: 400, success: false, message: "Project is not waiting for client approval", result: "", error: true });
        const { NotificationModel } = await import("../models/model.js");
        await NotificationModel.create({ userId: project.assignedTo, message: note?.trim() ? `Client approved your completed project "${project.title}". Note: ${note.trim()}` : `Client approved and completed your project "${project.title}".`, type: "project_completed", relatedProjectId: project._id.toString() });
        res.json({ code: 200, success: true, message: "Project completed successfully", result: project, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true }); }
}

export const requestProjectRevision = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, note } = req.body;
        if (!note?.trim()) return res.json({ code: 400, success: false, message: "Please add revision instructions for the freelancer", result: "", error: true });
        const project = await ProjectModel.findOneAndUpdate({ _id: projectId, clientId, status: "awaiting_review" }, { status: "in_progress" }, { new: true });
        if (!project) return res.json({ code: 400, success: false, message: "Project is not waiting for client review", result: "", error: true });
        const { NotificationModel } = await import("../models/model.js");
        await NotificationModel.create({ userId: project.assignedTo, message: `Client requested revisions on "${project.title}": ${note.trim()}`, type: "general", relatedProjectId: project._id.toString() });
        const developer = await userModel.findById(project.assignedTo);
        sendProjectEmail({ to: developer?.email, subject: `Revision requested: ${project.title}`, text: `The client requested revisions for "${project.title}".\n\n${note.trim()}` }).catch(() => {});
        res.json({ code: 200, success: true, message: "Revision request sent to freelancer", result: project, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true }); }
}

export const updateProjectStatus = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, status } = req.body; // status: "in_progress" | "completed" | "cancelled"
        const allowed = ["in_progress", "completed", "cancelled"];
        if (!allowed.includes(status) || status === "completed") {
            if (status === "completed") return res.json({ code: 400, success: false, message: "Project completion must be approved by the client after freelancer delivery", result: "", error: true });
            return res.json({ code: 400, success: false, message: "Invalid status", result: "", error: true })
        }
        const project = await ProjectModel.findOneAndUpdate(
            { _id: projectId, clientId },
            { status },
            { new: true }
        );
        if (!project) {
            return res.json({ code: 404, success: false, message: "Project not found or not yours", result: "", error: true })
        }
        res.json({ code: 200, success: true, message: `Project marked as ${status}`, result: project, error: false })
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true })
    }
}
