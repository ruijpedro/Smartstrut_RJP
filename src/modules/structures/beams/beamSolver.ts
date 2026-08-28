export interface BeamInput {
  span: number
  permanentLoad: number
  variableLoad: number
  pointLoad: number
}

export interface BeamResult {
  designUniformLoad: number
  reactionEach: number
  maxShear: number
  maxMoment: number
}

export function solveSimplySupportedBeam(input: BeamInput): BeamResult {
  const L = Math.max(0.001, input.span)
  const w = 1.35 * input.permanentLoad + 1.5 * input.variableLoad
  const P = 1.5 * input.pointLoad
  const reactionEach = (w * L + P) / 2
  return {
    designUniformLoad: w,
    reactionEach,
    maxShear: reactionEach,
    maxMoment: (w * L * L) / 8 + (P * L) / 4,
  }
}
