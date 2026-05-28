import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.studentName) {
      return NextResponse.json({ success: false, error: 'studentName is required' }, { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_report.py');

    // Spawn Python child process
    // Using 'python' since it was successfully verified in the user environment
    const child = spawn('python', [scriptPath]);

    // Send the JSON payload via stdin
    child.stdin.write(JSON.stringify(data));
    child.stdin.end();

    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];

    // Capture stdout (the generated PDF binary stream)
    child.stdout.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Capture stderr for debugging
    child.stderr.on('data', (chunk: Buffer) => {
      errChunks.push(chunk);
    });

    return new Promise<Response>((resolve) => {
      child.on('close', (code) => {
        if (code !== 0) {
          const errMsg = Buffer.concat(errChunks).toString('utf-8');
          console.error(`Python script exited with code ${code}. Error: ${errMsg}`);
          resolve(
            NextResponse.json(
              { success: false, error: `PDF generation failed: ${errMsg}` },
              { status: 500 }
            )
          );
        } else {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(
            new Response(pdfBuffer, {
              status: 200,
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Student_College_Intelligence_Report.pdf"',
                'Content-Length': pdfBuffer.length.toString(),
              },
            })
          );
        }
      });

      child.on('error', (err) => {
        console.error('Failed to spawn Python process:', err);
        resolve(
          NextResponse.json(
            { success: false, error: `Failed to spawn PDF engine: ${err.message}` },
            { status: 500 }
          )
        );
      });
    });

  } catch (error: any) {
    console.error('PDF Report API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
