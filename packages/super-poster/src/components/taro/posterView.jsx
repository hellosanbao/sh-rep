import { View, Image } from '@tarojs/components';
import { useMemo } from 'react';
import { getPreview } from '../../index';
import './index.css'

function renderHtml(html) {
  return html.map((item) => {
    switch (item.tag) {
      case 'image':
        return <Image src={item.src} style={item.styleStr} />;
      case 'text':
        return <View style={item.styleStr}>{item.value}</View>;
      case 'texts':
        return (
          <View style={item.styleStr}>
            {item.doms.map((dom, index) => {
              return (
                <View key={index} style={dom.styleStr}>
                  {dom.value}
                </View>
              );
            })}
          </View>
        );
      case 'view':
        return <View style={item.styleStr}>{renderHtml(item.doms || [])}</View>;
      case 'block':
        return <View style={item.styleStr}>{renderHtml(item.doms)}</View>;
      default:
        return '';
    }
  });
}

const PosterView = (props) => {
  const { json } = props;
  const html = useMemo(() => {
    return getPreview(props.json);
  }, [props.json]);

  return (
    <View
      className='poster-view-taro-container'
      style={{ width: json.displayWidth + 'rpx', height: (json.displayWidth / json.width) * json.height + 'rpx' }}
    >
      {renderHtml(html)}
    </View>
  );
};

export default PosterView;
