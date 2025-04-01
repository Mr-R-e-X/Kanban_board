import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { Board } from "@/models/Board.model";
import { getUserFromHeader } from "@/lib/get.user";
import { ApiResponse } from "@/app/types/apiResponse";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    await connectToDb();
    const boards = await Board.aggregate([
      {
        $match: { user_id: new Types.ObjectId(user._id) },
      },
      {
        $sort: { index: 1 },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          user_id: 1,
          index: 1,
          description: 1,
          overall_priority: 1,
          progress: 1,
        },
      },
    ]);
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: "Boards fetched successfully",
          sprints: boards,
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
