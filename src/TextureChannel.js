/**
 * Created by malloyzhu on 2016/2/18.
 */

var Util = {
    getAlphaChannel: function (image) {
        return this.getChannel(image, 3);
    },

    getRedChannel: function (image) {
        return this.getChannel(image, 0);
    },

    getGreenChannel: function (image) {
        return this.getChannel(image, 1);
    },

    getBlueChannel: function (image) {
        return this.getChannel(image, 2);
    },

    getChannel: function (image, channel) {
        var canvas = null;
        var ctx = null;
        if (image instanceof HTMLCanvasElement) {
            canvas = image;
            ctx = canvas.getContext("2d");
        } else {
            var canvas = this.createCanvas(image.width, image.height);
            ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
        }
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return this.extractChannel(imageData.data, canvas.width, canvas.height, channel);
    },

    createCanvas: function (w, h) {
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        return canvas;
    },

    extractChannel: function (data, width, height, channel) {
        var ret = typeof Uint8Array !== "undefined" ? new Uint8Array(width * height) : new Array(width * height);
        var pos = 0;
        for (var i = 0; i < data.length; i += 4) {
            ret[pos++] = data[i + channel];
        }
        return ret;
    }
};

function eventInTransparentMask(target, point, threshold) {
    threshold = threshold || 30;

    if (!target.mask) {
        target.mask = Util.getAlphaChannel(target.getTexture().getHtmlElementObj());
    }

    var tp = target.convertToNodeSpace(point);
    var lx = tp.x >> 0;
    var ly = tp.y >> 0;

    var transparentIndex = lx + (target.getTexture().height - ly) * target.getTexture().width;

    return target.mask[transparentIndex] <= threshold;
}

var HelloWorldLayer = cc.Layer.extend({
    sprite: null,
    ctor: function () {
        this._super();

        cc.SPRITE_DEBUG_DRAW = 1;

        this.sprite = new cc.Sprite(res.rockerBg_png);
        this.sprite.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        this.addChild(this.sprite);

        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesMoved: function (touches, event) {
                var touch = touches[0];
                if (cc.rectContainsPoint(event.getCurrentTarget().getBoundingBox(), touch.getLocation())) {
                    console.log("inside!");
                    if (eventInTransparentMask(event.getCurrentTarget(), touch.getLocation())) {
                        event.getCurrentTarget().setColor(cc.color(255, 0, 0, 255));
                        console.log("transparent!");
                    } else {
                        event.getCurrentTarget().setColor(cc.color(0, 255, 0, 255));
                        console.log("solid!");
                    }
                } else {
                    event.getCurrentTarget().setColor(cc.color(255, 255, 255, 255));
                    console.log("outside!");
                }
            }
        }), this.sprite);

        return true;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});