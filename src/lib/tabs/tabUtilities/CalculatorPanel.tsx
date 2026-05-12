import { Flex, Paper } from '@mantine/core'

export function CalculatorPanel({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" gap={16} style={{ alignSelf: 'center' }}>
      <Paper withBorder p={20}>
        <form>
          {children}
        </form>
      </Paper>
    </Flex>
  )
}
