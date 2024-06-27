let agiCountdownUrl = 'http://192.168.1.2:45500/agi-countdown';

let widget = new ListWidget();
widget.backgroundColor = new Color('#FFFFFF');

try {
    let agiCountdownReq = new Request(agiCountdownUrl);
    let agiCountdownImage = await agiCountdownReq.loadImage();

    let imageWidget = widget.addImage(agiCountdownImage);
    imageWidget.centerAlignImage();
} catch ( error ) {
    let errorMessage = widget.addText('Not on local network');
    errorMessage.textColor = new Color('#FF0000');
    errorMessage.font = Font.boldSystemFont(24); // Bold font
    errorMessage.centerAlignText();
}
if ( config.runsInWidget ) {
    Script.setWidget(widget);
    Script.complete();
} else {
    await widget.presentLarge();
}