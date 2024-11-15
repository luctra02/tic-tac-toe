// frontend/src/app/room/[roomID]/page.tsx

export default async function RoomPage({
    params,
}: {
    params: { roomID: string };
}) {
    const { roomID } = await params; // Await the params object

    return <div>Welcome to Room {roomID}</div>;
}
