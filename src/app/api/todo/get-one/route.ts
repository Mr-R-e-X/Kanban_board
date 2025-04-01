import { ApiResponse } from "@/app/types/apiResponse";
import { connectToDb } from "@/lib/db.connect";
import { getUserFromHeader } from "@/lib/get.user";
import { Task } from "@/models/Task.model";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { task_id } = await req.json();
    if (!task_id || !Types.ObjectId.isValid(task_id)) {
      return NextResponse.json<ApiResponse>(
        { error: "Valid board id is required." },
        { status: 400 }
      );
    }
    await connectToDb();
    const taskDetails = await Task.findOne({
      _id: new Types.ObjectId(task_id),
      user_id: user._id,
    });
    if (!taskDetails) {
      return NextResponse.json<ApiResponse>(
        { error: "Task not found" },
        { status: 400 }
      );
    }
    return NextResponse.json<ApiResponse>(
      { success: true, data: { taskDetails } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { error: error?.message || "Something went wrong" },
      { status: error?.status || 500 }
    );
  }
}
