import { NextResponse } from "next/server";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { cloudinary } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File wajib diisi." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { message: "Tipe file tidak didukung. Gunakan JPEG, PNG, atau WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ message: "Ukuran file maksimal 5MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "blusukan/destinasi" },
        (error: UploadApiErrorResponse | undefined, uploaded: UploadApiResponse | undefined) => {
          if (error || !uploaded) {
            reject(error ?? new Error("Upload ke Cloudinary gagal."));
            return;
          }
          resolve(uploaded);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch (error) {
    console.error("[API /upload]", error);
    return NextResponse.json({ message: "Gagal mengunggah foto. Coba lagi." }, { status: 500 });
  }
}
