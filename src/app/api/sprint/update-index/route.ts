import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { Board } from "@/models/Board.model";
import { getUserFromHeader } from "@/lib/get.user";
import { ApiResponse } from "@/app/types/apiResponse";
import { Types } from "mongoose";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderedSprints } = await req.json();

    if (!orderedSprints || !Array.isArray(orderedSprints)) {
      return NextResponse.json<ApiResponse>(
        { error: "Invalid or missing 'orderedSprints' array" },
        { status: 400 }
      );
    }

    if (orderedSprints.length === 0) {
      return NextResponse.json<ApiResponse>(
        { error: "No sprints to reorder" },
        { status: 400 }
      );
    }


    await connectToDb();

    const updates = orderedSprints.map((sprintId, i) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(sprintId) },
        update: { index: i + 1 + i * 0.5 },
      },
    }));

    const result = await Board.bulkWrite(updates);

    if (result.modifiedCount === 0) {
      return NextResponse.json<ApiResponse>(
        { error: "No sprints were updated" },
        { status: 400 }
      );
    }

    const sprints = await Board.find({}).sort({ index: 1 });
    const normalizeUpdates = sprints.map((sprint, i) => ({
      updateOne: {
        filter: { _id: sprint._id },
        update: { index: i + 1 },
      },
    }));

    await Board.bulkWrite(normalizeUpdates);

    return NextResponse.json<ApiResponse>(
      { success: true, data: { message: "Index updated successfully" } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating sprint order:", error);
    return NextResponse.json<ApiResponse>(
      { error: "Something went wrong while updating sprints" },
      { status: 500 }
    );
  }
}
