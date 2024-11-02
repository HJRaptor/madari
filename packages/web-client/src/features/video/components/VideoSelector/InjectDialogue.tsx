import { useAtom } from 'jotai/index';
import { videoInfoDialog } from '@/features/listing/atoms/video-info-dialog.ts';
import { SeriesDialog } from '@/features/video/components/VideoSelector/index.tsx';

export default function InjectDialogue() {
  const [videoInfoDialogAtom, setValue] = useAtom(videoInfoDialog);

  return (
    <>
      <SeriesDialog
        key={videoInfoDialogAtom?.id}
        isOpen={
          videoInfoDialogAtom?.type === 'series' && Boolean(videoInfoDialogAtom)
        }
        onClose={() => {
          setValue(null);
        }}
      />
    </>
  );
}
