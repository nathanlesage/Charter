import rgbHex from "rgb-hex"

export default class Color {
  private r: number
  private g: number
  private b: number
  private a: number

  constructor () {
    this.r = Math.random() * 255
    this.g = Math.random() * 255
    this.b = Math.random() * 255
    this.a = 0.8
  }

  private _assertColorRange (val: number, min: number, max: number) {
    if (val < min || val > max) {
      throw new Error(`Could not set ${val}: Out of bounds (${min}-${max}).`)
    }
  }

  set red (newVal: number) {
    this._assertColorRange(newVal, 0, 255)
    this.r = newVal
  }
  get red (): number { return this.r }

  set green (newVal: number) {
    this._assertColorRange(newVal, 0, 255)
    this.g = newVal
  }
  get green (): number { return this.g }

  set blue (newVal: number) {
    this._assertColorRange(newVal, 0, 255)
    this.b = newVal
  }
  get blue (): number { return this.b }

  set alpha (newVal: number) {
    this._assertColorRange(newVal, 0.0, 1.0)
    this.a = newVal
  }
  get alpha (): number { return this.a }

  // Enable easy stringification
  public toString (alpha?: number): string {
    if (alpha === undefined) {
      alpha = this.a
    }
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`
  }

  // Also to hex
  public toHex () {
    return rgbHex(this.r, this.g, this.b)
  }

  // And also enable outputting the reverse colour
  public inverseString (alpha?: number): string {
    if (alpha === undefined) {
      alpha = this.a
    }

    return `rgba(${255 - this.r}, ${255 - this.g}, ${255 - this.b}, ${alpha})`
  }

  // And finally, we also want this color to be able to output us shades
  public shadeArray (numShades: number, alpha?: number) {
    if (alpha === undefined) {
      alpha = this.a
    }

    // General: Shades work by multiplying the colour with 1/4, 1/2, etc.
    // Tints work by multiplying the inverse with the same ratio.
    // The smaller/greater the ratio, the darker/lighter the shade/tint.
    // Thanks to https://stackoverflow.com/a/6615053 for the super-easy
    // explanation.

    // First, let's determine how many shades and how many tints we need.
    // For that, we first compute how many theoretical values lie below
    // and above our current colour value.
    const valuesBelow = this.r + this.g + this.b - 3
    const valuesAbove = 255 - this.r + 255 - this.g + 255 - this.b
    // All three components add up to 765, so the sum is 762 (minus the
    // three components from our actual colour).
    // const sum = 762
    // How many bins do we need? This determines the distance between colours.
    const part = 762 / numShades
    // Now we can see how often these parts fit into the two slices of the
    // colour range and we know how many shades and how many tints we need.
    const shades = Math.floor(valuesBelow / part)
    const tints = Math.floor(valuesAbove / part)
    // NOTE: We have to floor to make space for our one "normal" color that
    // we want to stack in between its shades and tints.
    
    // Now build the array. We go from dark to light. Otherwise would also
    // be possible.
    const ret = []
    for (let i = shades; i >= 0; i--) {
      const r = this.r / (i + 1)
      const g = this.g / (i + 1)
      const b = this.b / (i + 1)
      ret.push(`rgba(${r}, ${g}, ${b}, ${alpha})`)
    }

    // Add the actual colour in between
    ret.push(this.toString(alpha))

    // Third, add the tints.
    for (let i = 1; i <= tints; i++) {
      const r = this.r + (255 - this.r) / (tints - i + 1)
      const g = this.g + (255 - this.g) / (tints - i + 1)
      const b = this.b + (255 - this.b) / (tints - i + 1)
      ret.push(`rgba(${r}, ${g}, ${b}, ${alpha})`)
    }

    return ret // Et voilà!
  }
}
