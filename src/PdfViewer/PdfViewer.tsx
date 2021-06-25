import React from 'react';


class PDFViewer extends React.Component {
  private readonly viewerRef: React.RefObject<unknown>;
  private backend: any;

  constructor(props: any) {
    super(props);
    this.viewerRef = React.createRef();
    this.backend = new props.backend();
  }

  componentDidMount() {
    // @ts-ignore
    const {src} = this.props;
    const element = this.viewerRef.current;

    this.backend.init(src, element);
  }

  render() {
    return (
      // @ts-ignore
      <div ref={this.viewerRef} id='viewer' style={{width: '100%', height: '100%'}}>

      </div>
    )
  }
}

export default PDFViewer;