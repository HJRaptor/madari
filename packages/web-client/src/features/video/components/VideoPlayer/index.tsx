import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { StreamingUrlParser } from '../../utils/extract-info.ts';

export function VideoPlayer() {
  const params = useParams();

  const param = params['*'];

  const parsed = useMemo(() => {
    return StreamingUrlParser.parse(param ?? '');
  }, [param]);

  console.log(parsed);

  return <></>;
}
