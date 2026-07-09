import { Image, Stack, Text } from '@mantine/core'
import wxQr from 'assets/wexin.jpg'

export function DonateTab() {
  return (
    <Stack
      align='center'
      justify='center'
      gap='xl'
      style={{ minHeight: '80vh', padding: '40px 20px' }}
    >
      <Stack align='center' gap='xs' style={{ maxWidth: 480, textAlign: 'center' }}>
        <Text size='lg' fw={600} c='white'>
          你好啊！我是整个夏天最能BB的蝉，叫我阿蝉小蝉都行！
        </Text>
        <Text c='dimmed' style={{ lineHeight: 1.8 }}>
          你居然点进了我的打赏页，你是来给我买零食的吗！？
          <br />
          不管买不买，点进来的都是个好心人~
          <br />
          感谢使用我的网站小工具，你的支持就是我更新的动力！
        </Text>
      </Stack>

      <Image
        src={wxQr}
        alt='微信收款码'
        w={240}
        h={240}
        fit='contain'
        radius='md'
      />

      <Stack align='center' gap={4} style={{ maxWidth: 400, textAlign: 'center' }}>
        <Text size='sm' c='dimmed' fw={500}>不能让大家白来，给大家书一段吉祥话：</Text>
        <Text size='sm' c='gray.4' style={{ lineHeight: 2 }}>
          愿您家里天天有欢笑，身体天天满状态；
          <br />
          爱情一路绿灯，抽卡一路金光；
          <br />
          欧气持续在线，快乐永不掉线！
        </Text>
      </Stack>
    </Stack>
  )
}
