import { NextResponse } from 'next/server';

// Temporary in-memory store for demonstration purposes
// In a real app, this would be a database like PostgreSQL or MongoDB
let mockDatabaseTasks = [];

export async function POST(request) {
    try {
        const data = await request.json();

        // Validate slack payload
        if (!data.text || !data.user_name) {
            return NextResponse.json({ error: "Invalid payload from Slack" }, { status: 400 });
        }

        const newTask = {
            id: `task-slack-${Date.now()}`,
            columnId: "backlog",
            title: data.text,
            tags: ["Slack", "New Request"],
            dueDate: new Date().toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
            comments: 0,
            attachments: 0,
            assignee: data.user_name.charAt(0).toUpperCase(),
        };

        mockDatabaseTasks.push(newTask);

        return NextResponse.json({
            success: true,
            message: "Task added to O2 Kanban Backlog!",
            task: newTask
        });

    } catch (error) {
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ tasks: mockDatabaseTasks });
}
