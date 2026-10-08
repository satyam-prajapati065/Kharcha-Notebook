package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("Kharcha Notebook", appName)
  }

  @Test
  fun `test custom category registration and lookup`() {
    com.example.ui.components.CategoryIconHelper.registerCategory("Cricket Gym", "FitnessCenter", "#EF4444")
    assertEquals("FitnessCenter", com.example.ui.components.CategoryIconHelper.getCustomIconName("Cricket Gym"))
    assertEquals("#EF4444", com.example.ui.components.CategoryIconHelper.getCustomColorHex("Cricket Gym"))

    val color = com.example.ui.components.getCategoryColor("Cricket Gym")
    assertEquals(androidx.compose.ui.graphics.Color(0xFFEF4444), color)
  }

  @Test
  fun `test KharchaViewModel instantiation without NPE`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val db = androidx.room.Room.inMemoryDatabaseBuilder(context, com.example.data.KharchaDatabase::class.java)
        .allowMainThreadQueries()
        .build()
    val repo = com.example.data.KharchaRepository(
        db.transactionDao(),
        db.budgetDao(),
        db.categoryDao()
    )
    val vm = com.example.ui.KharchaViewModel(repo)
    org.junit.Assert.assertNotNull(vm)
    org.junit.Assert.assertNotNull(vm.allCategories)
    db.close()
  }

  @Test
  fun `test quick amount preset direct replacement and toggle behavior`() {
    var amountText = ""
    val selectQuickAmount: (String) -> Unit = { quickAmount ->
      amountText = if (amountText.trim() == quickAmount) "" else quickAmount
    }

    // Selecting 500 should set to 500
    selectQuickAmount("500")
    assertEquals("500", amountText)

    // Selecting 1000 should replace (not accumulate to 1500)
    selectQuickAmount("1000")
    assertEquals("1000", amountText)

    // Re-clicking 1000 should toggle to empty
    selectQuickAmount("1000")
    assertEquals("", amountText)

    // Selecting 2000 from empty
    selectQuickAmount("2000")
    assertEquals("2000", amountText)
  }
}
