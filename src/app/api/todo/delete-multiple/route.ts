import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { getUserFromHeader } from "@/lib/get.user";
import { Task } from "@/models/Task.model";
import { ApiResponse } from "@/app/types/apiResponse";

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { task_ids } = await req.json();
    if (!task_ids) {
      return NextResponse.json<ApiResponse>(
        { error: "Array of Task id is required." },
        { status: 401 }
      );
    }
    if (!Array.isArray(task_ids) || task_ids.length === 0) {
      return NextResponse.json<ApiResponse>(
        { error: "task_ids should be a non-empty array." },
        { status: 400 }
      );
    }
    await connectToDb();
    const result = await Task.deleteMany({
      _id: { $in: task_ids },
      user_id: user._id,
    });
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: "Tasks deleted successfully",
          deletedCount: result.deletedCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { error: error?.message || "Something went wrong" },
      { status: error?.status || 500 }
    );
  }
}
