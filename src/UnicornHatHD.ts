import SPI from "pi-spi";

const DEFAULT_BRIGHTNESS = 0.5;
const DEFAULT_RGB: RGB = {
    r: 0,
    g: 0,
    b: 0
}

type RGB = {
    r: number,
    g: number,
    b: number,
};

type Coordinates = {
    x: number,
    y: number,
}

type UnicornHatHDConfig = {
    device: string,
    brightness?: number,
}

type Matrix = Array<Array<RGB>>;

class UnicornHatHD {
    spi: SPI.SPI;
    matrix: Matrix = [];
    private _brightness = DEFAULT_BRIGHTNESS;

    constructor({ device, brightness }: UnicornHatHDConfig) {
        this.spi = SPI.initialize(device);
        this.generateMatrix();

        if (brightness) {
            this._brightness = brightness;
        }
    }

    get brightness() {
        return this._brightness;
    }

    set brightness(brightness: number) {
        this._brightness = brightness;
    }

    getRGBAtCoordinates({ x, y } : Coordinates): RGB {
        return this.matrix[x][y];
    }

    setRGBAtCoordinates({ x, y } : Coordinates, rgb: RGB) {
        this.matrix[x][y] = rgb;
    }

    show() {
        const buffer = new Buffer(16 * 16 * 3);

        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                buffer[y * 16 * 3 + x * 3 + 0] = this.matrix[x][y].r * this._brightness;
                buffer[y * 16 * 3 + x * 3 + 1] = this.matrix[x][y].g * this._brightness;
                buffer[y * 16 * 3 + x * 3 + 2] = this.matrix[x][y].b * this._brightness;
            }
        }

        this.spi.write(Buffer.concat([new Buffer([0x72]), buffer]), (error) => {
            if (error) {
                throw new Error('An error occured while writing via SPI');
            }
        })
    }

    setAll({ r, g, b }: RGB) {
        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                this.matrix[x][y] = DEFAULT_RGB;
            }
        }
    }

    clear() {
        this.setAll(DEFAULT_RGB);
    }

    private generateMatrix() {
        for (let x = 0; x < 16; x++) {
            this.matrix.push([]);
            for (let y = 0; y < 16; y++) {
                this.matrix[x][y] = DEFAULT_RGB;
            }
        }
    }
}

export default UnicornHatHD;
