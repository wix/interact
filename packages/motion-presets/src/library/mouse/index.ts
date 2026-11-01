import AiryMouseCreate, { schema as AiryMouseSchema } from './AiryMouse';
import BlobMouseCreate, { schema as BlobMouseSchema } from './BlobMouse';
import BlurMouseCreate, { schema as BlurMouseSchema } from './BlurMouse';
import BounceMouseCreate, { schema as BounceMouseSchema } from './BounceMouse';
import { create as CustomMouseCreate, schema as CustomMouseSchema } from './CustomMouse';
import ScaleMouseCreate, { schema as ScaleMouseSchema } from './ScaleMouse';
import SkewMouseCreate, { schema as SkewMouseSchema } from './SkewMouse';
import SpinMouseCreate, { schema as SpinMouseSchema } from './SpinMouse';
import SwivelMouseCreate, { schema as SwivelMouseSchema } from './SwivelMouse';
import Tilt3DMouseCreate, { schema as Tilt3DMouseSchema } from './Tilt3DMouse';
import Track3DMouseCreate, { schema as Track3DMouseSchema } from './Track3DMouse';
import TrackMouseCreate, { schema as TrackMouseSchema } from './TrackMouse';

// the factory is the registered effect, so its schema is attached to it
export const AiryMouse = Object.assign(AiryMouseCreate, { schema: AiryMouseSchema });
export const BlobMouse = Object.assign(BlobMouseCreate, { schema: BlobMouseSchema });
export const BlurMouse = Object.assign(BlurMouseCreate, { schema: BlurMouseSchema });
export const BounceMouse = Object.assign(BounceMouseCreate, { schema: BounceMouseSchema });
export const CustomMouse = Object.assign(CustomMouseCreate, { schema: CustomMouseSchema });
export const ScaleMouse = Object.assign(ScaleMouseCreate, { schema: ScaleMouseSchema });
export const SkewMouse = Object.assign(SkewMouseCreate, { schema: SkewMouseSchema });
export const SpinMouse = Object.assign(SpinMouseCreate, { schema: SpinMouseSchema });
export const SwivelMouse = Object.assign(SwivelMouseCreate, { schema: SwivelMouseSchema });
export const Tilt3DMouse = Object.assign(Tilt3DMouseCreate, { schema: Tilt3DMouseSchema });
export const Track3DMouse = Object.assign(Track3DMouseCreate, { schema: Track3DMouseSchema });
export const TrackMouse = Object.assign(TrackMouseCreate, { schema: TrackMouseSchema });
