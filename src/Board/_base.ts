import type { GeometryContext } from "../Geometry";

export class BaseBoard {

  public get geometryContext(): GeometryContext {
    throw new Error("Board must implement context getter");
  }

  public get width(): number {
    throw new Error("Board must implement width getter");
  }

  public get height(): number {
    throw new Error("Board must implement height getter");
  }

}
